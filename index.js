/**
 * @file index.js
 * Main File
 */

/**
 * @defgroup Doxygen
 * Module for generating automated documentation
 */

"use strict";

module.exports = new NodeDoxygen();

function NodeDoxygen() {
    this.run = require("./lib/execution").run;
    this.downloadVersion = require("./lib/version").downloadVersion;
    this.createConfig = require("./lib/config").createConfig;
}