/**
 * @file configModule.js
 * Module for generating the configuration file
 */
"use strict";

module.exports.createConfig = createConfig;

var helpers = require("./helpers");
var constants = require("./constants");
var path = require("path");
var fs = require("fs");

/**
 * Creates the config file
 * @ingroup Doxygen
 * @param {Object} doxygenOptions - The options to include in the config file
 * @param {String} configPath - The route on which the config file should be created
 */
function createConfig(doxygenOptions, configPath) {
    configPath = configPath ? configPath : constants.path.configFile;

    var configLines = [];
    for (var property in doxygenOptions) {
        var configLine = property + " = ";

        if (property === "INPUT"){
          if(Array.isArray(doxygenOptions[property])) {
            doxygenOptions[property] = doxygenOptions[property].map(p => "\"" + path.resolve(p) + "\"")
          }
          else {
            doxygenOptions[property] = "\"" + path.resolve(doxygenOptions[property]) + "\"";
          }
        }

        if (property === "OUTPUT_DIRECTORY"){
          doxygenOptions[property] = "\"" + path.resolve(doxygenOptions[property]) + "\"";
        }

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
