"use strict";

var versionModule = require("./src/versionModule");
var configModule = require("./src/configModule");

var exec = require("child_process").execSync;

function run(configPath, version) {
    version = version ? version : versionModule.defaultVersion;
    configPath = configPath ? configPath : configModule.defaultConfigPath;
    var dirName = __dirname;

    exec("\"" + dirName + "\\dist\\" + version + "\\doxygen\" \"" + configPath + "\"");
}

module.exports = {
    run: run,
    installVersion: versionModule.installVersion,
    createConfig: configModule.createConfig
};