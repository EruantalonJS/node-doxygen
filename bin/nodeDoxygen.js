#!/usr/bin/env node

var doxygen = require("../lib/nodeDoxygen");

var doxygenParams = process.argv.slice(2);
var operation = "docs";
var operationSet = false;
var configPath;
var params;
var version;

for (var i = 0; i < doxygenParams.length; i++) {
    console.log(doxygenParams[i]);
    if (doxygenParams[i].startsWith("--jsonParams=")) {
        console.log(doxygenParams[i].substring(13));
        params = JSON.parse(doxygenParams[i].substring(13));
    }
    else if (doxygenParams[i].startsWith("--configPath=")) {
        configPath = doxygenParams[i].substring(13);
    }
    else if (doxygenParams[i].startsWith("--version=")) {
        version = doxygenParams[i].substring(10);
    }
    else if (doxygenParams[i] == "--config") {
        if (operationSet) {
            console.warn("Option --config ignored: Only one command can be executed at the same time");
        }
        else {
            operationSet = true;
            operation = "config";
        }

    } else if (doxygenParams[i] == "--download") {
        if (operationSet) {
            console.warn("Option --download ignored: Only one command can be executed at the same time");
        }
        else {
            operationSet = true;
            operation = "download";
        }
    } else if (doxygenParams[i] == "--docs") {
        if (operationSet) {
            console.warn("Option --docs ignored: Only one command can be executed at the same time");
        }
        else {
            operationSet = true;
            operation = "docs";
        }
    }
}

switch (operation) {
    case ("docs"):
        doxygen.run(configPath, version);
        break;

    case ("config"):
        doxygen.createConfig(params, configPath);
        break;

    case ("download"):
        doxygen.downloadVersion(version);
        break;
}