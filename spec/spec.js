var doxygen = require("../index");
var rimraf = require("rimraf");

describe("Download:", function () {
    beforeEach(function (done) {
        rimraf("dist", function (error) {
            if (error) {
                throw error;
            } else {

                done();
            }
        });
    });

    it("FTP", function (done) {
        doxygen.downloadVersion()
            .then(function () {
                done();
            }, function (error) {
                done();
                done.fail(error);
            });
    }, 120000);

    it("HTTP", function (done) {
        doxygen.downloadVersion(null, "http").then(function () {
            done();
        }, function (error) {
            done();
            done.fail(error);
        });
    }, 120000);
});


describe("Generates the config:", function () {
    beforeEach(function (done) {
        rimraf("testResults", function (error) {
            if (error) {
                throw error;
            } else {
                done();
            }
        });
    });

    it("Base scenario", function () {
        var userOptions = {
            OUTPUT_DIRECTORY: "testResults/Docs",
            INPUT: "./",
            RECURSIVE: "YES",
            //WARN_IF_DOC_ERROR: "NO",
            FILE_PATTERNS: ["*.js", "*.md"],
            EXTENSION_MAPPING: "js=Javascript",
            GENERATE_LATEX: "NO",
            EXCLUDE_PATTERNS: ["*/node_modules/*", "*/filters/*"],
            PROJECT_NAME: "Node-Doxygen",
            USE_MDFILE_AS_MAINPAGE: "README.md"
        };
        doxygen.createConfig(userOptions, "testResults/config");
    });
});

describe("Generates the docs:", function () {
    it("Base scenario", function () {
        doxygen.run("testResults/config");
    });
});