/**
 * @file helpers.js
 * Helpers in the doxygen module
 */

/**
 * Strict Mode
 */
"use strict";

/**
 * Import fs module
 */
var fs = require("fs");

/**
 * Import path module
 */
var path = require("path");

/**
 * Export helper functions
 */
module.exports = {
    ensureDirectoryExistence: ensureDirectoryExistence,
    ftpDownload: ftpDownload,
    httpDownload: httpDownload
}

/**
 * @ingroup Doxygen
 * Makes sure that a folder route exists, creating
 * the folders if necesary
 * @param filePath {String} - The path.
 * @param notDir {Boolean} - True if the path does not reference a directory
 */
function ensureDirectoryExistence(filePath, notDir) {
    if (!fs.existsSync(filePath)) {
        var dirname = path.dirname(filePath);
        ensureDirectoryExistence(dirname);
        if (!notDir) {
            fs.mkdirSync(filePath);
        }
    }
}

/**
 * @ingroup Doxygen
 * Downloads a doxygen version with ftp protocol
 * @param hostName {String} - The host from which to download the doxygen file
 * @param fileRoute {String} - The route from which to download the doxygen file
 * @param user {String}- The user to connect with
 * @param password {String} - The password to connect
 */
function ftpDownload(hostName, fileRoute, user, password) {
    var ftp = require("ftp");

    var ftpConfig = {
        host: hostName,
        user: user,
        password: password
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
 * @ingroup Doxygen
 * Downloads a doxygen version with ftp protocol
 * @param url {String} - The url from which to download the doxygen file
 * @param protocol {String} - The protocol to use(http or https)
 * @param downloadModule {Object} - The download module to use(http or https)
 */
function httpDownload(url, protocol, downloadModule) {
    if (protocol) {
        downloadModule = require(protocol);
    }
    return new Promise(function (resolve, reject) {
        downloadModule.get(url, function (response) {
            //handle redirect
            if (response.statusCode === 302) {
                httpDownload(response.headers.location, null, downloadModule)
                    .then(function(response) {
                        resolve(response);
                    }, function(error){
                        reject(error);
                    });
            } else {
                resolve(response);
            }
        }).on("error", function (e) {
            reject("Request error: " + e.message);
        });
    });
}