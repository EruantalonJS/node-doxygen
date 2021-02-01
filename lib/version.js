/**
 * @file version.js
 * Module for downloading doxygen versions
 */

/**
 * Strict Mode
 */
"use strict";

/**
 * Export downloadVersion function
 */
module.exports.downloadVersion = downloadVersion;

/**
 * Import toArray module
 */
var toArray = require("stream-to-array");

/**
 * Import fs module
 */
var fs = require("fs-extra");

/**
 * Import Promise module
 */
var Promise = require("promise");

/**
 * Import constants
 */
var constants = require("./constants");

/**
 * Import helpers
 */
var helpers = require("./helpers");

/**
 * @ingroup Doxygen
 * Downloads a doxygen version
 * @param version {String}: The version to download
 * @param protocol {String}: The protocol to be used to download the file
 * @param hostName {String}: The host from which to download the doxygen file
 * @param fileRoute {String}: The route from which to download the doxygen file
 * @param distRoute {String}: The base dir to place the doxygen files
 */
function downloadVersion(version, protocol, hostName, fileRoute, distRoute) {
    version = version ? version : constants.default.version;
    protocol = protocol ? protocol : constants.default.downloadProtocol;
    hostName = hostName ? hostName : constants.default.downloadHostName;
    distRoute = distRoute ? distRoute : constants.default.distRoute;
    fileRoute = fileRoute ? fileRoute : getFileRoute(version);

    var versionRoute = distRoute + "/" + version;

    helpers.ensureDirectoryExistence(versionRoute);
    
    return downloadVersionUnsafe(versionRoute, protocol, hostName, fileRoute);
}

/**
 * @ingroup Doxygen
 * Downloads a doxygen version without validating the input parameters
 * @param versionRoute {String}: The route to place the doxygen files
 * @param protocol {String}: The protocol to be used to download the file
 * @param hostName {String}: The host from which to download the doxygen file
 * @param fileRoute {String}: The route from which to download the doxygen file
 */
function downloadVersionUnsafe(versionRoute, protocol, hostName, fileRoute) {

    var dataPromise = getDataPromise(protocol, hostName, fileRoute);

    return new Promise(function (resolve, reject) {
        dataPromise
            .then(toArray)
            .then(arrayToBuffer)
            .then(decompressFunction(versionRoute, fileRoute))
            .then(function () {
                resolve(true);
            })
            .catch(function (error) {
                reject(error);
            });
    });
}

/**
 * @ingroup Doxygen
 * Downloads a doxygen version
 * @param protocol {String} - The protocol to be used to download the file
 * @param hostName {String} - The host from which to download the doxygen file
 * @param fileRoute {String} - The route from which to download the doxygen file
 */
function getDataPromise(protocol, hostName, fileRoute) {
    switch (protocol){
        case "http":
        case "https":
            return helpers.httpDownload(protocol + "://" + hostName + "/" + fileRoute, protocol);
        case "ftp":
            return helpers.ftpDownload(hostName, fileRoute);
        default:
            throw constants.error.invalidProtocol;
    }
}

/**
 * @ingroup Doxygen
 * Returns the file route to obtain the appropiate doxygen file from the official site
 * @param version {String} - The protocol to be used to download the file
 * @returns {String} The file route
 */
function getFileRoute(version) {
    var osInfo;

    switch (process.platform){
        case constants.platform.macOS.identifier:
            osInfo = constants.platform.macOS;
            break;
        case constants.platform.linux.identifier:
            osInfo = constants.platform.linux;
            break;
        case constants.platform.solaris.identifier:
            osInfo = constants.platform.solaris;
            break;
        case constants.platform.windows.identifier:
            osInfo = constants.platform.windows;
            break;
        default:
            throw constants.error.invalidPlatform;
    }

    return constants.default.downloadFileRoute
        .replace(/%doxygenName%/g, osInfo.doxygenName)
        .replace(/%version%/g, version)
        .replace(/%osPrefix%/g, osInfo.osPrefix)
        .replace(/%x64Prefix%/g, process.arch == "x64" ? osInfo.x64Prefix : "")
        .replace(/%extension%/g, osInfo.extension);
}

/**
 * @ingroup Doxygen
 * Returns the function to decompress the files
 * @param versionRoute {String}: The route to place the doxygen files
 * @param fileRoute {String}: The route from which to download the doxygen file
 * @returns {Function<Promise<Buffer>>} A buffer
 */
function decompressFunction(versionRoute, fileRoute) {
    return function(buffer) {
        if (fileRoute.endsWith(".dmg")) {
            return decompressDmg(buffer, versionRoute);
        } else {
            return decompressNonDmg(buffer, versionRoute);
        }
    }
}

/**
 * @ingroup Doxygen
 * Creates a buffer with all the segments of a download
 * @param parts {Object} - The array containing all the segments of the download
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
 * @ingroup Doxygen
 * Uncompresses the file contained in the buffer, and copies the results to the route specified
 * @param buffer {Object} - The file downloaded
 * @param destinationPath {String} - The route on which the files must be copied
 * @returns {Promise<File[]>} A promise returning the list of files
 */
function decompressNonDmg(buffer, destinationPath) {
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

/**
 * @ingroup Doxygen
 * Takes a dmg file from the buffer and copies the files contained to the route specified
 * @param buffer {Object} - The file downloaded
 * @param filePath {String} - The route on which the files must be copied
 * @returns {Promise<File[]>} A promise returning the list of files
 */
function decompressDmg(buffer, filePath) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filePath + "/doxygen.dmg", buffer, "binary", function (error) {
            if (error) {
                reject(error);
            } else {
                copyFileFromDmg(filePath + "/doxygen.dmg", filePath + "/doxygen.app")
                    .then(function () {
                        resolve(true);
                    }, function(error){
                        reject(error);
                    });
            }
        });
    });
}

/**
 * @ingroup Doxygen
 * Uncompresses a dmg file, and copies the results to the route specified
 * @param dmgFilePath {Object} - The route of the dmg file
 * @param destinationPath {String} - The route on which the files must be copied
 */
function copyFileFromDmg(dmgFilePath, destinationPath) {
    return new Promise(function (resolve, reject) {
        var dmg = require("dmg");
        dmg.mount(dmgFilePath, function (error, path) {
            if (error) {
                reject(error);
            } else {
                try {
                    fs.copySync(path + "/Doxygen.app", destinationPath);
                    dmg.unmount(path, function () {
                        resolve(true);
                    });
                } catch (error) {
                    rejectCleanup(error, path);
                }

            }
        });

        function rejectCleanup(error, dmgMounted) {
            dmg.unmount(dmgMounted, function () {
                reject(error);
            });
        }
    });
}