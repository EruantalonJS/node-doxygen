"use strict";

module.exports.installVersion = installVersion;
module.exports.defaultVersion = "1.8.12";

var Promise = require("promise");
var extend = require("extend");
var ftp = require("ftp");
var unzip = require("unzip");
var fs = require("fs");
var exec = require("child_process").execSync;

var defaultOptions = {
    hostName: "ftp.stack.nl",
    fileName: "pub/users/dimitri/doxygen-%version%.%os%.%extension%",
    version: "1.8.12",
    os: "windows.x64",
    extension: "bin.zip"
};

function cbSaveDoxygen(client, outputPath, callBack) {
    return function (err, stream) {
        if (err) throw err;
        stream.once("close", function () {
            client.end();
            cbAfterDownload(outputPath, callBack);
        });
        stream
            .pipe(unzip.Parse())
            .on("entry", function (entry) {
                entry.pipe(fs.createWriteStream(outputPath + "\\" + entry.path));
            });
    };
}

function cbAfterDownload(outputPath, callBack) {
    exec("\"" + outputPath + "\\doxygen\" -s -g \"" + outputPath + "\\sampleConfig\"");

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

    if (callBack) {
        callBack();
    }
}

function installVersion(userOptions, callBack) {
    var options = extend(defaultOptions, userOptions);
    var dirName = __dirname;
    var distRoute = dirName + "\\..\\dist";
    var versionRoute = distRoute + "\\" + options.version;
    var fileName = options.fileName
        .replace("%version%", options.version)
        .replace("%os%", options.os)
        .replace("%extension%", options.extension);
    var dirExists = false;

    try {
        dirExists = fs.statSync(distRoute).isDirectory();
    } catch (exception) {
        //if it doesn't exist, swallow the error
    }

    if (!dirExists) {
        fs.mkdirSync(distRoute);
    }
    dirExists = false;

    try {
        dirExists = fs.statSync(versionRoute).isDirectory();
    } catch (exception) {
        //if it doesn't exist, swallow the error
    }
    if (!dirExists) {
        fs.mkdirSync(versionRoute);
    }

    var client = new ftp();
    client.on("ready", function () {
        client.get(fileName, cbSaveDoxygen(client, versionRoute, callBack));
    });

    var ftpConfig = {
        host: options.hostName
    };
    client.connect(ftpConfig);
}