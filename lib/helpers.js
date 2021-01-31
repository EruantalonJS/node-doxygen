/**
 * @file helpers.js
 * Helpers in the doxygen module
 */
"use strict";

var fs = require("fs");
var path = require("path");

module.exports.ensureDirectoryExistence = ensureDirectoryExistence;
module.exports.ftpDownload = ftpDownload;
module.exports.httpDownload = httpDownload;

/**
 * Makes sure that a folder route exists, creating
 * the folders if necesary
 * @param {String} filePath - The path.
 * @param {Boolean} notDir - True if the path does not reference a directory
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
 * Downloads a doxygen version with ftp protocol
 * @param {String} hostName - The host from which to download the doxygen file
 * @param {String} fileRoute - The route from which to download the doxygen file
 * @param {String} user - The user to connect with
 * @param {String} password - The password to connect
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
 * Downloads a doxygen version with ftp protocol
 * @param {String} fileRoute - The url from which to download the doxygen file
 * @param {String} protocol - The protocol to use(http or https)
 * @param {any} downloadModule - The download module to use(http or https)
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