/**
 * @file nodeDoxygen.js
 * Main File
 */

/**
 * @defgroup Doxygen
 * Module for generating automated documentation
 */

"use strict";

module.exports = new NodeDoxygen();

function NodeDoxygen() {
    this.run = require("./execution").run;
    this.downloadVersion = require("./version").downloadVersion;
    this.createConfig = require("./config").createConfig;
}