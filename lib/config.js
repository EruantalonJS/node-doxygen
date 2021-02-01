/**
 * @file config.js
 * Module for generating the configuration file
 */

 
/**
 * Strict Mode
 */
"use strict";

/**
 * Export createConfig function
 */
module.exports.createConfig = createConfig;

/**
 * Import helpers
 */
var helpers = require("./helpers");

/**
 * Import constants
 */
var constants = require("./constants");

/**
 * Import path module
 */
var path = require("path");

/**
 * Import fs module
 */
var fs = require("fs");

/**
 * Creates the config file
 * @ingroup Doxygen
 * @param doxygenOptions {Object} - The options to include in the config file
 * @param configPath {String} - The route on which the config file should be created
 */
function createConfig(doxygenOptions, configPath) {
    configPath = configPath ? configPath : constants.path.configFile;

    doxygenOptions = convertUrlsToPaths(doxygenOptions);

    var configLines = [];
    for (var property in doxygenOptions) {
        var configLine = property + " = ";
        if (Array.isArray(doxygenOptions[property])) {
            configLine += doxygenOptions[property].join(" \\ \n");
        } else {
            configLine += doxygenOptions[property];
        }

        configLines.push(configLine);
    }

    helpers.ensureDirectoryExistence(configPath, true);
    fs.writeFileSync(configPath, configLines.join("\n"));
}

/**
 * Transforms a url to be stored as a path in the config
 * @param url {String} - The string to be stored as a path
 */
function convertUrlToPath(url){
    return "\"" + path.resolve(url) + "\"";
}

/**
 * Transforms a url to be stored as a path in the config
 * @param doxygenOptions {Object} - The options to include in the config file
 */
function convertUrlsToPaths(doxygenOptions){
    if (doxygenOptions && doxygenOptions["INPUT"]){
        if(Array.isArray(doxygenOptions["INPUT"])) {
            doxygenOptions["INPUT"] = doxygenOptions["INPUT"]
                .map(relativePath => convertUrlToPath(relativePath));
        }
        else {
            doxygenOptions["INPUT"] = convertUrlToPath(doxygenOptions["INPUT"]);
        }
    }
    
    if (doxygenOptions && doxygenOptions["OUTPUT_DIRECTORY"]){
        doxygenOptions["OUTPUT_DIRECTORY"] = convertUrlToPath(doxygenOptions["OUTPUT_DIRECTORY"]);
    }

    return doxygenOptions;
}