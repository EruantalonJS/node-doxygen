/**
 * @file helpers.js
 * Helpers in the doxygen module
 */
"use strict";

var fs = require("fs");
var path = require("path");

module.exports.ensureDirectoryExistence = ensureDirectoryExistence;

/**
 * Makes sure that a folder route exists, creating
 * the folders if necesary
 * @param {String} filePath - The path.
 */
function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}