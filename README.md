Doxygen
===========

[![npm Package](https://img.shields.io/npm/v/doxygen.svg?style=flat-square)](https://www.npmjs.org/package/doxygen)
![Build Status](https://github.com/EruantalonJS/node-doxygen/workflows/.github/workflows/build.yml/badge.svg)
[![Code Climate](https://codeclimate.com/github/EruantalonJS/node-doxygen/badges/gpa.svg)](https://codeclimate.com/github/EruantalonJS/node-doxygen)
[![Test Coverage](https://api.codeclimate.com/v1/badges/fdf3669cb9c21ff97eb4/test_coverage)](https://codeclimate.com/github/EruantalonJS/node-doxygen/test_coverage)

Node wrapper for building [Doxygen](https://www.doxygen.org) documentation.

This module is not associated with [Doxygen](https://www.doxygen.org)
## Setup

This module is a wrapper around Doxygen, to automate the installation and generation of doxygen documentation so that it can be easily included in any project build. Supports Linux, Windows, and MacOS. It supports both local and global installation. 

In the case of linux, it may require clang to be installed (Versions vary depending on the doxygen version chosen)

`npm install doxygen`

or globally

`npm install doxygen -g `

## Invoking from a task

Downloads the latest doxygen version from the default repository

```javascript

var doxygen = require('doxygen');
doxygen.downloadVersion().then(function (data) {
        doSomething();
});

```

Create an empty config file(Takes all defaults):

```javascript

var doxygen = require('doxygen');
var userOptions = {};

doxygen.createConfig(userOptions);

```

Create a config file that includes js files:

```javascript

var doxygen = require('doxygen');
var userOptions = {
    OUTPUT_DIRECTORY: "Docs",
    INPUT: "./",
    RECURSIVE: "YES",
    FILE_PATTERNS: ["*.js", "*.md"],
    EXTENSION_MAPPING: "js=Javascript",
    GENERATE_LATEX: "NO",
    EXCLUDE_PATTERNS: ["*/node_modules/*"]
};

doxygen.createConfig(userOptions);

```

Generate the documentation

```javascript

var doxygen = require('doxygen');
doxygen.run();

```

## Invoking from CLI

Downloads the latest doxygen version from the default repository

`doxygen --download`

Create a config file(Takes all defaults):

`doxygen --config`

Create a config file in a particular location(Takes all defaults):

`doxygen --config --configPath=\path\to\file`

Create a config file in a particular location, passing some parameters:

`doxygen --config --configPath=\path\to\file --jsonParams={\"OUTPUT_DIRECTORY\":\"Docs\",\"INPUT\":\"./\",\"RECURSIVE\":\"YES\",\"FILE_PATTERNS\":[\"*.js\",\"*.md\"],\"EXTENSION_MAPPING\":\"js=Javascript\",\"GENERATE_LATEX\":\"NO\",\"EXCLUDE_PATTERNS\":[\"*/node_modules/*\"]}`

Generate the documentation

`doxygen --docs`

Generate the documentation using a particular config file:

`doxygen --docs --configPath=\path\to\file`
