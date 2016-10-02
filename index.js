"use strict";

var installModule = require("./src/installVersion");
var configModule = require("./src/createConfig");

var exec = require("child_process").execSync;
var extend = require("extend");
var defaultOptions = {
    version: "1.8.12"
};

function run(userOptions) {
    var options = extend(defaultOptions, userOptions);

    if (!options.configPath) {
        throw "A valid doxygen config file must be provided via the configPath property";
    } else {
        var dirName = __dirname;
        exec("\"" + dirName + "\\dist\\" + options.version + "\\doxygen\" \"" + options.configPath + "\"");
    }
}

module.exports = {
    run: run,
    installVersion: installModule.installVersion,
    createConfig: configModule.createConfig
};