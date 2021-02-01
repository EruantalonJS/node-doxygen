/**
 * @file execution.js
 * Module for generating automated documentation
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
 * Import constants
 */
var constants = require("./constants");

/**
 * Import exec module
 */
var exec = require("child_process").execSync;

/**
 * Import path module
 */
var path = require("path");

/**
 * Export execution functions
 */
module.exports = {
    run: run,
    isDoxygenExecutableInstalled: isDoxygenExecutableInstalled
};

/**
 * @ingroup Doxygen
 * Returns a path for doxygen executable given a version.
 * @param version {String} - The version of doxygen to run.
 *    If not passed uses default version from constants
 */
function doxygenExecutablePath(version) {
    version = version ? version : constants.default.version;
    var dirName = __dirname;
    var doxygenFolder = "";
    if (process.platform == constants.platform.macOS.identifier) {
        doxygenFolder = constants.path.macOsDoxygenFolder;
    }

    var ext = (process.platform == constants.platform.windows.identifier) ? ".exe" : "";
    return path.normalize(dirName + "/../dist/" + version + doxygenFolder + "/doxygen" + ext);
}

/**
 * @ingroup Doxygen
 * Returns whether a particular version of doxygen is installed.
 * @param version {String} - The version of doxygen to run.
 *    If not passed uses default version from constants
 */
function isDoxygenExecutableInstalled(version) {
    var execPath = doxygenExecutablePath(version);
    return fs.existsSync(execPath);
}

/**
 * @ingroup Doxygen
 * Runs doxygen from node
 * @param configPath {String}  - The path of the config file
 * @param version {String}  - The version of doxygen to run
 */
function run(configPath, version) {
    configPath = configPath ?
        configPath : 
        constants.path.configFile;
    var doxygenPath = doxygenExecutablePath(version);
    fs.writeFileSync('./logFile.log', exec("\"" + doxygenPath + "\" \"" + path.resolve(configPath) + "\""));
}
