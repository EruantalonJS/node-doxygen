"use strict";

var versionModule = require("./src/versionModule");
var configModule = require("./src/configModule");

var exec = require("child_process").execSync;
var path = require("path");

function run(configPath, version) {
    version = version ? version : versionModule.defaultVersion;
    configPath = configPath ? configPath : configModule.defaultConfigPath;
    var dirName = __dirname;
    var doxygenFolder = "";
    if (process.platform == "darwin") {
        doxygenFolder = "/doxygen.app/Contents/Resources";
    }

    var doxygenPath = path.normalize(dirName + "/dist/" + version + doxygenFolder + "/doxygen");
    exec(path.normalize("\"" + doxygenPath + "\" \"" + configPath + "\""));
}

module.exports = {
    run: run,
    installVersion: versionModule.installVersion,
    createConfig: configModule.createConfig
};