/**
 * @file executionModule.js
 * Module for generating automated documentation
 */

"use strict";

module.exports.run = run;

var constants = require("./constants");

var exec = require("child_process").execSync;
var path = require("path");

/**
 * @ingroup Doxygen
 * Runs doxygen from node
 * @param {String} configPath - The path of the config file
 * @param {String} version - The version of doxygen to run
 */
function run(configPath, version) {
    version = version ? version : constants.default.version;
    configPath = configPath ? configPath : constants.path.configFile;
    var dirName = __dirname;
    var doxygenFolder = "";
    if (process.platform == constants.platform.macOS.identifier) {
        doxygenFolder = constants.path.macOsDoxygenFolder;
    }

    var doxygenPath = path.normalize(dirName + "/../dist/" + version + doxygenFolder + "/doxygen");
    exec("\"" + doxygenPath + "\" \"" + path.resolve(configPath) + "\"", { stdio: ["pipe", process.stdout, "pipe"] });
}