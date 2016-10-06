"use strict";

module.exports.createConfig = createConfig;
module.exports.defaultConfigPath = "config";

var versionModule = require("./versionModule");

var extend = require("extend");
var fs = require("fs");

function createConfig(userOptions, version, configPath) {
    version = version ? version : versionModule.defaultVersion;
    configPath = configPath ? configPath : exports.defaultConfigPath;
    if (!userOptions.OUTPUT_DIRECTORY) {
        throw "OUTPUT_DIRECTORY is undefined: A valid output folder must be provided";
    } else if (!userOptions.INPUT) {
        throw "INPUT is undefined: A valid source file or folder must be provided";
    } else {
        var dirname = __dirname;
        var versionDir = dirname + "/../dist/" + version + "/";
        var templateConfig = fs.readFileSync(versionDir + "templateConfig").toString();
        var defaultConfig = JSON.parse(fs.readFileSync(versionDir + "defaultConfig.json").toString());
        var options = extend(defaultConfig, userOptions);
        var configLines = templateConfig.split("\n");
        for (var configIndex in configLines) {
            var configLine = configLines[configIndex];
            var propertyName = configLine.substring(0, configLine.indexOf("=")).trim();
            var propertyValue = options[propertyName] ? options[propertyName] : "";
            configLine = configLine.replace("%" + propertyName + "%", propertyValue);
            configLines[configIndex] = configLine;
        }

        fs.writeFileSync(configPath, configLines.join("\n"));
    }
}