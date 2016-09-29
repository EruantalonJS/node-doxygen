'use strict';

module.exports.installVersion = installVersion;

var extend = require('extend');
var ftp = require('ftp');
var unzip = require('unzip');
var fs = require('fs');
var defaultOptions = {
    hostName:"ftp.stack.nl",
    fileName:"pub/users/dimitri/doxygen-%version%.%os%.%extension%",
    version: "1.8.12",
    os: "windows.x64",
    extension: "bin.zip"
}

function cbSaveDoxygen(client, outputPath, callBack){
    return function (err, stream) {
        if (err) throw err;
        stream.once('close', function() { 
            client.end(); 
            if(callBack){
                callBack();
            }
        });
        stream
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            entry.pipe(fs.createWriteStream(outputPath + '\\' + entry.path));
        });
    }
}

function installVersion(userOptions, callBack) {
    var options = extend(defaultOptions, userOptions);
    var dirName = __dirname;
    var distRoute = dirName + '\\..\\dist';
    var versionRoute = distRoute + '\\' + options.version;
    var fileName = options.fileName
        .replace("%version%", options.version)
        .replace("%os%", options.os)
        .replace("%extension%", options.extension)
    var dirExists = false;
    
    try{
        dirExists = fs.statSync(distRoute).isDirectory();
    } catch (exception) { }
    
    if (!dirExists){
        fs.mkdirSync(distRoute);
    }
    dirExists = false;

    try{
        dirExists = fs.statSync(versionRoute).isDirectory()
    } catch (exception) { }
    if (!dirExists){
        fs.mkdirSync(versionRoute);
    }

    var client = new ftp();
    client.on('ready', function() {
        client.get(fileName, cbSaveDoxygen(client,versionRoute,callBack));
    });

    var ftpConfig = {
        host:options.hostName
    };
    client.connect(ftpConfig);
}