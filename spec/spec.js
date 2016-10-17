describe("Doxygen version installer", function () {
    var doxygen = require("../index");
    var path = require("path");

    beforeEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    });

    it("Installs from ftp", function (done) {
        doxygen.installVersion().then(function (data) {
            done();
        }, function (error) {
            done.fail(error);
        });
    });

    it("Installs from http", function (done) {
        var httpOptions = {
            protocol: "http"
        };
        doxygen.installVersion(httpOptions).then(function (data) {
            done();
        }, function (error) {
            done.fail(error);
        });
    });

    it("Generates the config", function () {
        var userOptions = {
            OUTPUT_DIRECTORY: "testDocs",
            INPUT: "./",
            RECURSIVE: "YES",
            EXCLUDE_PATTERNS: "*/node_modules/*"
        };
        doxygen.createConfig(userOptions);
    });

    it("Generates the docs", function () {
        doxygen.run();
    });

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    });
});