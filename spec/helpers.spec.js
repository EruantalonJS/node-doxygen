var helpers = require("../lib/helpers");

describe("Downloads a file:", function () {
    it("Using http", function (done) {
        helpers.httpDownload("http://speedtest.ftp.otenet.gr/files/test1Mb.db", "http")
            .then(function () {
                done();
            }, function (error) {
                done();
                done.fail(error);
            });
    }, 36000);

    it("Using ftp", function (done) {
        helpers.ftpDownload("speedtest:speedtest@ftp.otenet.gr","test1Mb.db")
        .then(function () {
            done();
        }, function (error) {
            done();
            done.fail(error);
        });
    }, 36000);
});