var doxygen = require("../lib/nodeDoxygen");
var rimraf = require("rimraf");
var exec = require("child_process").execSync;

describe("Downloads a version:", function () {
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
    }, 360000);

    it("HTTP", function (done) {
        doxygen.downloadVersion(null, "http").then(function () {
            done();
        }, function (error) {
            done();
            done.fail(error);
        });
    }, 360000);
});

describe("Generates the config:", function () {

    it("From a task, with the default config location", function () {
        var userOptions = {
            OUTPUT_DIRECTORY: "testResults/Docs",
            INPUT: "./",
            RECURSIVE: "YES",
            FILE_PATTERNS: ["*.js", "*.md"],
            EXTENSION_MAPPING: "js=Javascript",
            GENERATE_LATEX: "NO",
            EXCLUDE_PATTERNS: ["*/node_modules/*", "*/filters/*"],
            PROJECT_NAME: "Node-Doxygen",
            USE_MDFILE_AS_MAINPAGE: "README.md"
        };
        doxygen.createConfig(userOptions);
    });

    it("From a task, with a custom config location", function () {
        var userOptions = {
            OUTPUT_DIRECTORY: "testResults/Docs",
            INPUT: "./",
            RECURSIVE: "YES",
            FILE_PATTERNS: ["*.js", "*.md"],
            EXTENSION_MAPPING: "js=Javascript",
            GENERATE_LATEX: "NO",
            EXCLUDE_PATTERNS: ["*/node_modules/*", "*/filters/*"],
            PROJECT_NAME: "Node-Doxygen",
            USE_MDFILE_AS_MAINPAGE: "README.md"
        };
        doxygen.createConfig(userOptions, "testResults/config");
    });

    it("From CLI, with the default config location", function () {
        var userOptions = {
            OUTPUT_DIRECTORY: "testResults/Docs",
            INPUT: "./",
            RECURSIVE: "YES",
            FILE_PATTERNS: ["*.js", "*.md"],
            EXTENSION_MAPPING: "js=Javascript",
            GENERATE_LATEX: "NO",
            EXCLUDE_PATTERNS: ["*/node_modules/*", "*/filters/*"],
            PROJECT_NAME: "Node-Doxygen",
            USE_MDFILE_AS_MAINPAGE: "README.md"
        };

        exec("node ./bin/nodeDoxygen.js --config --jsonParams="
            + JSON.stringify(JSON.stringify(userOptions)), { stdio: ["pipe", process.stdout, "pipe"] });
    });

    it("From CLI, with a custom config location", function () {
        var userOptions = {
            OUTPUT_DIRECTORY: "testResults/Docs",
            INPUT: "./",
            RECURSIVE: "YES",
            FILE_PATTERNS: ["*.js", "*.md"],
            EXTENSION_MAPPING: "js=Javascript",
            GENERATE_LATEX: "NO",
            EXCLUDE_PATTERNS: ["*/node_modules/*", "*/filters/*"],
            PROJECT_NAME: "Node-Doxygen",
            USE_MDFILE_AS_MAINPAGE: "README.md"
        };
        exec("node ./bin/nodeDoxygen.js --config --configPath=testResults/config --jsonParams="
            + JSON.stringify(JSON.stringify(userOptions)), { stdio: ["pipe", process.stdout, "pipe"] });
    });
});

var testVersions = ["1.8.20", "1.9.1"];

testVersions.forEach(version => {
    describe("Downloads a version from a task(" + version + "):", function () {
        beforeAll(function (done) {
            rimraf("dist", function (error) {
                if (error) {
                    throw error;
                } else {
                    done();
                }
            });
        }, 36000);

        it("The version should not be installed before installing", function () {
            expect(doxygen.isDoxygenExecutableInstalled(version)).toBe(false);
        });

        it("The version should install without errors", function () {
            doxygen.downloadVersion(version)
                .then(function () {
                    done();
                }, function (error) {
                    throw error;
                });
        });
    
        it("The version should not be installed after installing", function () {
            expect(doxygen.isDoxygenExecutableInstalled(version)).toBe(true);
        });
    });

    describe("Downloads a version from CLI(" + version + "):", function () {
        beforeEach(function (done) {
            rimraf("testResults/Docs", function (error) {
                if (error) {
                    throw error;
                } else {
                    done();
                }
            });
        });

        it("The version should not be installed before installing", function () {
            expect(doxygen.isDoxygenExecutableInstalled(version)).toBe(false);
        });

        it("The version should install without errors", function () {
            exec("node ./bin/nodeDoxygen.js --download --version=" + version, { stdio: ["pipe", process.stdout, "pipe"] });
        });
    
        it("The version should not be installed after installing", function () {
            expect(doxygen.isDoxygenExecutableInstalled(version)).toBe(true);
        });
    });

    describe("Generates the docs(" + version + "):", function () {
        beforeEach(function (done) {
            rimraf("dist", function (error) {
                if (error) {
                    throw error;
                } else {
                    done();
                }
            });
        }, 36000);
    
        it("The documentation should be generated with a custom config location", function () {
            doxygen.run("testResults/config", version);
        });
    
        it("The documentation should be generated with the default config location", function () {
            doxygen.run(null, version);
        });
    
        it("From CLI, with a custom config location", function () {
            exec("node ./bin/nodeDoxygen.js --docs --version=" + version + " --configPath=testResults/config", { stdio: ["pipe", process.stdout, "pipe"] });
        });
    
        it("From CLI, with the default config location", function () {
            exec("node ./bin/nodeDoxygen.js --docs --version=" + version , { stdio: ["pipe", process.stdout, "pipe"] });
        });
    });
});