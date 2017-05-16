/**
 * @file versionModule.js
 * Module for downloading doxygen versions
 */

"use strict";

module.exports.downloadVersion = downloadVersion;

var toArray = require("stream-to-array");
var fs = require("fs-extra");
var Promise = require("promise");
var constants = require("./constants");
var helpers = require("./helpers");

/**
 * @ingroup Doxygen
 * Downloads a doxygen version
 * @param {String} version - The version to download
 * @param {String} protocol - The protocol to be used to download the file
 * @param {String} hostName - The host from which to download the doxygen file
 * @param {String} fileRoute - The route from which to download the doxygen file
 */
function downloadVersion(version, protocol, hostName, fileRoute) {
    protocol = protocol ? protocol : constants.default.downloadProtocol;
    version = version ? version : constants.default.version;
    hostName = hostName ? hostName : constants.default.downloadHostName;
    fileRoute = fileRoute ? fileRoute : getFileRoute(version);

    //create directories if necessary
    var dirName = __dirname;
    var distRoute = dirName + "/../dist";
    var versionRoute = distRoute + "/" + version;
    helpers.ensureDirectoryExistence(distRoute);
    helpers.ensureDirectoryExistence(versionRoute);

    var dataPromise;

    if (protocol == "http") {
        dataPromise = httpDownload(hostName, fileRoute);
    } else if (protocol == "ftp") {
        dataPromise = ftpDownload(hostName, fileRoute);
    } else {
        throw constants.error.invalidProtocol;
    }

    return new Promise(function (resolve, reject) {
        return dataPromise
            .then(toArray)
            .then(arrayToBuffer)
            .then(function (buffer) {
                return unCompressFiles(buffer, versionRoute, fileRoute.endsWith(".dmg"));
            })
            .then(function () {
                resolve(true);
            })
            .catch(function (error) {
                reject(error);
            });
    });
}

/**
 * Returns the file route to obtain the appropiate doxygen file from the official site
 * @returns {String} The file route
 */
function getFileRoute(version) {
    var osInfo;

    if (process.platform == constants.platform.macOS.identifier) {
        osInfo = constants.platform.macOS;
    } else if (process.platform == constants.platform.linux.identifier) {
        osInfo = constants.platform.linux;
    } else if (process.platform == constants.platform.solaris.identifier) {
        osInfo = constants.platform.solaris;
    } else if (process.platform == constants.platform.windows.identifier) {
        osInfo = constants.platform.windows;
    } else {
        throw constants.error.invalidPlatform;
    }

    return constants.default.downloadFileRoute
        .replace("%version%", version)
        .replace("%osPrefix%", osInfo.osPrefix)
        .replace("%x64Prefix%", process.arch == "x64" ? osInfo.x64Prefix : "")
        .replace("%extension%", osInfo.extension);
}

/**
 * Downloads a doxygen version with ftp protocol
 * @param {String} hostName - The host from which to download the doxygen file
 * @param {String} fileRoute - The route from which to download the doxygen file
 */
function ftpDownload(hostName, fileRoute) {
    var ftp = require("ftp");

    var ftpConfig = {
        host: hostName
    };

    return new Promise(function (resolve, reject) {
        var client = new ftp();

        function afterGet(err, stream) {
            if (err) {
                reject(err);
            } else {
                stream.once("close", function () {
                    client.end();
                });
                resolve(stream);
            }
        }

        client.on("ready", function () {
            client.get(fileRoute, afterGet);
        });

        client.on("error", function (error) {
            reject(error);
        });

        client.connect(ftpConfig);
    });
}

/**
 * Downloads a doxygen version with ftp protocol
 * @param {String} hostName - The host from which to download the doxygen file
 * @param {String} fileRoute - The route from which to download the doxygen file
 */
function httpDownload(hostName, fileRoute) {
    var http = require("http");
    return new Promise(function (resolve, reject) {
        http.get("http://" + hostName + "/" + fileRoute, function (response) {
            resolve(response);
        }).on("error", function (e) {
            reject("Request error: " + e.message);
        });
    });
}

/**
 * Creates a buffer with all the segments of a download
 * @param {Object} parts - The array containing all the segments of the download
 * @returns {Object} A buffer
 */
function arrayToBuffer(parts) {
    var buffers = [];
    for (var i = 0, l = parts.length; i < l; ++i) {
        var part = parts[i];
        buffers.push((part instanceof Buffer) ? part : new Buffer(part));
    }
    return Buffer.concat(buffers);
}

/**
 * Uncompresses the file contained in the buffer, and copies the results to the route specified
 * @param {Object} buffer - The file downloaded
 * @param {String} destinationPath - The route on which the files must be copied
 * @param {Boolean} isDmg - A flag indicating wether the file is a dmg
 */
function unCompressFiles(buffer, destinationPath, isDmg) {
    if (isDmg) {
        return bufferToFile(buffer, destinationPath + "/doxygen.dmg").then(
            function () {
                return copyFileFromDmg(destinationPath + "/doxygen.dmg", destinationPath + "/doxygen.app");
            }
        );
    }
    else {
        var decompress = require("decompress");
        return decompress(buffer, destinationPath, {
            filter: function (file) {
                return file.path.endsWith("doxygen") ||
                    file.path.endsWith("doxygen.exe") ||
                    file.path.endsWith("doxyindexer") ||
                    file.path.endsWith("doxyindexer.exe") ||
                    file.path.endsWith("doxysearch.cgi.exe") ||
                    file.path.endsWith("doxysearch.cgi") ||
                    file.path.endsWith("libclang.dll");
            },
            map: function (file) {
                file.path = file.path.substring(file.path.lastIndexOf("/") + 1);
                return file;
            }
        });
    }
}

/**
 * Takes a file from the buffer and copies the results to the route specified
 * @param {Object} buffer - The file downloaded
 * @param {String} destinationPath - The route on which the files must be copied
 */
function bufferToFile(buffer, filePath) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filePath, buffer, "binary", function (error) {
            if (error) {
                reject(error);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Uncompresses a dmg file, and copies the results to the route specified
 * @param {Object} dmgFilePath - The route of the dmg file
 * @param {String} destinationPath - The route on which the files must be copied
 */
function copyFileFromDmg(dmgFilePath, destinationPath) {
    return new Promise(function (resolve, reject) {
        var dmgMounted;

        //Mount the dmg
        var dmg = require("dmg");
        dmg.mount(dmgFilePath, function (error, path) {
            if (error) {
                rejectCleanup(error);
            } else {
                dmgMounted = path;
            }

            try {
                fs.copySync(dmgMounted + "/Doxygen.app", destinationPath);
            } catch (error) {
                rejectCleanup(error);
            }

            dmg.unmount(dmgMounted, function () {
                resolve(true);
            });
        });

        function rejectCleanup(error) {
            if (dmgMounted) {
                dmg.unmount(dmgMounted, function () {
                    reject(error);
                });
            }
            else {
                reject(error);
            }
        }
    });
}