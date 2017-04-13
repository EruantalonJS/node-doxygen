doxygen
===========

Node plugin for building [Doxygen](www.doxygen.org) documentation.

This module is not associated with [Doxygen](www.doxygen.org)
##Setup

`npm install doxygen`

##Current version: 0.1.0

This module automates the installation and generation of doxygen documentation so that it can be easily included as a build step

##Examples of use

Install the latest doxygen version from the default repository

```javascript

var doxygen = require('doxygen');
doxygen.installVersion().then(function (data) {
        doSomething();
});

```

Create a config file with some custom properties

```javascript

var doxygen = require('doxygen');
var userOptions = {
    OUTPUT_DIRECTORY: "testDocs",
    INPUT: "./",
    RECURSIVE: "YES",
    EXCLUDE_PATTERNS: "*/node_modules/*"
};
doxygen.createConfig(userOptions);

```

Generate the documentation

```javascript

var doxygen = require('doxygen');
doxygen.run();

```