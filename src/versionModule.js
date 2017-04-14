"use strict";

module.exports.installVersion = installVersion;
module.exports.defaultVersion = "1.8.13";

var toArray = require("stream-to-array");
var extend = require("extend");
var fs = require("fs");
var path = require("path");
var exec = require("child_process").execSync;

var platform;
var extension;
var modelName = "pub/users/dimitri/doxygen-%version%.%os%%extension%";

if (process.platform == "freebsd") {
    throw "OS not supported by doxygen";
} else if (process.platform == "darwin") {
    modelName = "pub/users/dimitri/Doxygen-%version%%extension%";
    extension = ".dmg";
} else if (process.platform == "linux") {
    platform = "linux";
    extension = ".bin.tar.gz";
} else if (process.platform == "sunos") {
    platform = "solaris";
    extension = ".bin.tar.gz";
} else if (process.platform == "win32") {
    extension = ".bin.zip";
    if (process.arch == "x64") {
        platform = "windows.x64";
    } else {
        platform = "windows";
    }
}

var defaultOptions = {
    hostName: "ftp.stack.nl",
    fileName: modelName,
    version: module.exports.defaultVersion,
    os: platform,
    extension: extension,
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
    var doxygenPath = path.normalize(outputPath + "/doxygen");
    var sampleConfigPath = path.normalize(outputPath + "/sampleConfig");
    var templateConfigPath = path.normalize(outputPath + "/templateConfig");
    var defaultConfigPath = path.normalize(outputPath + "/defaultConfig.json");
    try {
        exec("\"" + doxygenPath + "\" -s -g \"" + sampleConfigPath + "\"");
    } catch (ex) {
        throw ex;
    }

    var sampleConfig = fs.readFileSync(sampleConfigPath).toString();
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

    fs.writeFileSync(templateConfigPath, templateLines.join("\n"));
    fs.writeFileSync(defaultConfigPath, "{\n" + defaultLines.join("\n") + "\"\n}");
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
                stream.once("close", function () {
                    client.end();
                });
                resolve(stream);
            }
        }

        client.on("ready", function () {
            client.get(options.fileName, afterGet);
        });

        client.on("error", function (error) {
            reject(error);
        });

        client.connect(ftpConfig);
    });
}

function httpDownload(options) {
    var http = require("http");
    return new Promise(function (resolve, reject) {
        http.get("http://" + options.hostName + "/" + options.fileName, function (response) {
            resolve(response);
        }).on("error", function (e) {
            reject("Request error: " + e.message);
        });
    });
}

function arrayToBuffer(parts) {
    var buffers = [];
    for (var i = 0, l = parts.length; i < l; ++i) {
        var part = parts[i];
        buffers.push((part instanceof Buffer) ? part : new Buffer(part));
    }
    return Buffer.concat(buffers);
}

function bufferToFile(buffer, filePath) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filePath, buffer, "binary", function (error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

function copyFileFromDmg(dmgFilePath, target) {
    return new Promise(function (resolve, reject) {
        var readStream;
        var writeStream;
        var dmgMounted;

        //Mount the dmg
        var dmg = require("dmg");
        dmg.mount(dmgFilePath, function (error, path) {
            if (error) {
                rejectCleanup(error);
            } else {
                dmgMounted = path;
            }

            readStream = fs.createReadStream(dmgMounted + "/doxygen");
            readStream.on("error", rejectCleanup);
            writeStream = fs.createWriteStream(target);
            writeStream.on("error", rejectCleanup);
            writeStream.on("finish", function () {
                dmg.unmount(dmgFilePath, function () {
                    resolve();
                });
            });
            readStream.pipe(writeStream);

        });

        function rejectCleanup(error) {
            readStream && readStream.destroy();
            writeStream && writeStream.end();
            dmgMounted && dmg.unmount(dmgFilePath);
            reject(error);
        }
    });
}

function unCompressFiles(buffer, versionRoute, isOSX) {
    if (isOSX) {
        return bufferToFile(buffer, versionRoute + "/doxygen" + defaultOptions.extension).then(
            function () {
                return copyFileFromDmg(versionRoute + "/doxygen" + defaultOptions.extension);
            }
        );
    }
    else {
        var decompress = require("decompress");
        return decompress(buffer, versionRoute, {
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

function installVersion(userOptions) {

    var options = extend(defaultOptions, userOptions);
    options.fileName = options.fileName
        .replace("%version%", options.version)
        .replace("%os%", options.os)
        .replace("%extension%", options.extension);

    //create directories if necessary

    var dirName = __dirname;
    var distRoute = dirName + "/../dist";
    var versionRoute = distRoute + "/" + options.version;
    tryCreateFolder(distRoute);
    tryCreateFolder(versionRoute);

    var dataPromise;

    if (options.protocol == "http") {
        dataPromise = httpDownload(options);
    } else {
        dataPromise = ftpDownload(options);
    }

    return dataPromise.then(toArray)
        .then(arrayToBuffer)
        .then(function (buffer) {
            return unCompressFiles(buffer, versionRoute, options.os == "");
        })
        .then(function () {
            createConfigTemplate(versionRoute);
            return;
        });
}