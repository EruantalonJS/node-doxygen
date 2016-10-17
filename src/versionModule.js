"use strict";

module.exports.installVersion = installVersion;
module.exports.defaultVersion = "1.8.12";

var Promise = require("promise");
var extend = require("extend");
var unzip = require("unzip");
var fs = require("fs");
var exec = require("child_process").execSync;

var defaultOptions = {
    hostName: "ftp.stack.nl",
    fileName: "pub/users/dimitri/doxygen-%version%.%os%.%extension%",
    version: "1.8.12",
    os: "windows.x64",
    extension: "bin.zip",
    protocol: "ftp"
};

function tryCreateFolder(folderPath) {
    var dirExists = false;
    try {
        dirExists = fs.statSync(folderPath).isDirectory();
    } catch (exception) {
        //if it doesn't exist, swallow the error
    }

    if (!dirExists) {
        fs.mkdirSync(folderPath);
    }
}

function createConfigTemplate(outputPath) {
    try {
        exec("\"" + outputPath + "\\doxygen\" -s -g \"" + outputPath + "\\sampleConfig\"");
    } catch (ex) {
        throw ex;
    }

    var sampleConfig = fs.readFileSync(outputPath + "\\sampleConfig").toString();
    var sampleLines = sampleConfig.split(/\r|\n/);
    var templateLines = [];
    var defaultLines = [];
    var varName, fullVarName, eqIndex, value;

    for (var index in sampleLines) {
        var curLine = sampleLines[index];
        if (curLine != "" && !curLine.startsWith("#")) {
            eqIndex = curLine.indexOf("=");
            if (eqIndex !== -1) {
                fullVarName = curLine.substring(0, eqIndex);
                varName = fullVarName;
                varName = varName.trim();
                templateLines.push(fullVarName + "= %" + varName + "%");

                defaultLines[defaultLines.length - 1] += "\",";
                value = JSON.stringify(curLine.substring(eqIndex + 2));
                varName = "\"" + varName + "\" : " + value.substring(0, value.length - 1);
                defaultLines.push(varName);
            } else {
                value = JSON.stringify(curLine);
                defaultLines[defaultLines.length - 1] += " \\n" + value.substring(1, value.length - 1);
            }
        }
    }

    fs.writeFileSync(outputPath + "\\templateConfig", templateLines.join("\n"));
    fs.writeFileSync(outputPath + "\\defaultConfig.json", "{\n" + defaultLines.join("\n") + "\"\n}");
}

function ftpDownload(options) {
    var ftp = require("ftp");

    var ftpConfig = {
        host: options.hostName
    };

    return new Promise(function (resolve, reject) {
        var client = new ftp();

        function afterGet(err, stream) {
            if (err) {
                reject(err);
            } else {
                stream.once('close', function () {
                    client.end();
                });
                resolve(stream);
            }
        }

        client.on("ready", function () {
            client.get(options.fileName, afterGet)
        });

        client.on("error", function () {
            client.get(options.fileName, afterGet)
        });

        client.connect(ftpConfig);
    })
}

function httpDownload(options) {
    var http = require("http");
    return new Promise(function (resolve, reject) {
        http.get("http://" + options.hostName + "/" + options.fileName, function (response) {
            resolve(response);
        }).on("error", function (e) {
            reject("Request error: " + e.message);
        });
    })
}

function installVersion(userOptions) {
    return new Promise(function (resolve, reject) {

        var options = extend(defaultOptions, userOptions);
        options.fileName = options.fileName
            .replace("%version%", options.version)
            .replace("%os%", options.os)
            .replace("%extension%", options.extension);

        //create directories if necessary

        var dirName = __dirname;
        var distRoute = dirName + "\\..\\dist";
        var versionRoute = distRoute + "\\" + options.version;
        tryCreateFolder(distRoute);
        tryCreateFolder(versionRoute);

        var dataPromise;

        if (options.protocol == 'http') {
            dataPromise = httpDownload(options);
        } else {
            dataPromise = ftpDownload(options);
        }

        dataPromise.then(function (stream) {

            stream.pipe(unzip.Parse())
                .on("entry", function (entry) {
                    entry.pipe(fs.createWriteStream(versionRoute + "\\" + entry.path));
                })
                .on("close", function (entry) {
                    createConfigTemplate(versionRoute);
                    resolve();
                });
        }, function (error) {
            reject(error);
        });
    });
}