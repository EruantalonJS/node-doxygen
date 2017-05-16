Doxygen
===========

[![npm Package](https://img.shields.io/npm/v/doxygen.svg?style=flat-square)](https://www.npmjs.org/package/doxygen)
[![Build Status](https://travis-ci.org/EruantalonJS/node-doxygen.svg?branch=master)](https://travis-ci.org/EruantalonJS/node-doxygen)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/xu8avh9iguwey4yh?svg=true)](https://ci.appveyor.com/project/EruantalonJS/node-doxygen)
[![Code Climate](https://codeclimate.com/github/EruantalonJS/node-doxygen/badges/gpa.svg)](https://codeclimate.com/github/EruantalonJS/node-doxygen)

Node wrapper for building [Doxygen](www.doxygen.org) documentation.

This module is not associated with [Doxygen](www.doxygen.org)
## Setup

`npm install doxygen`

This module is a wrapper around Doxygen, to automate the installation and generation of doxygen documentation so that it can be easily included in any project build. Supports Linux, Windows, and MacOS

## Usage samples

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