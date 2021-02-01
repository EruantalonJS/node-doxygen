/**
 * @file nodeDoxygen.js
 * Main File
 */

/**
 * @defgroup Doxygen Doxygen
 * Module for generating automated documentation
 */

/**
 * Strict Mode
 */
"use strict";

/**
 * Import execution module
 */
var execution = require("./execution");

/**
 * Export doxygen functions
 */
module.exports = new NodeDoxygen();

/**
 * @ingroup Doxygen
 * Creates the node-doxygen object to expose
 */
function NodeDoxygen() {
    this.run = execution.run;
    this.isDoxygenExecutableInstalled = execution.isDoxygenExecutableInstalled;
    this.downloadVersion = require("./version").downloadVersion;
    this.createConfig = require("./config").createConfig;
}
