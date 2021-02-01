/**
 * @file constants.js
 * Module containing all the constant strings
 */

/**
 * Strict Mode
 */
"use strict";

/**
 * Export constants
 */
module.exports = {
    error: {
        invalidProtocol: "The protocol specified is not supported",
        invalidPlatform: "The current OS is not supported"
    },
    path: {
        macOsDoxygenFolder: "/doxygen.app/Contents/Resources",
        configFile: "config"
    },
    platform: {
        macOS: {
            doxygenName: "Doxygen-",
            identifier :"darwin",
            extension: ".dmg",
            x64Prefix: "",
            osPrefix: ""
        },
        linux: {
            doxygenName: "doxygen-",
            identifier :"linux",
            extension: ".bin.tar.gz",
            x64Prefix: "",
            osPrefix: ".linux"
        },
        solaris: {
            doxygenName: "doxygen-",
            identifier :"sunos",
            extension: ".bin.tar.gz",
            x64Prefix: "",
            osPrefix: ".solaris"
        },
        windows: {
            doxygenName: "doxygen-",
            identifier :"win32",
            extension: ".bin.zip",
            x64Prefix: ".x64",
            osPrefix: ".windows"
        }
    },
    default: {
        version: "1.9.1",
        downloadProtocol: "https",
        downloadFileRoute: "rel-%version%/%doxygenName%%version%%osPrefix%%x64Prefix%%extension%",
        downloadHostName: "downloads.sourceforge.net/project/doxygen/"
    }
};