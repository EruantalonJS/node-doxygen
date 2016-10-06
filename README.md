doxygen
===========

Node plugin for building [Doxygen](www.doxygen.org) documentation.

This module is not related with [Doxygen](www.doxygen.org)
##Setup

`npm install doxygen`

##About this module

This module is in its first stages and lacking important features.

This are some of the goals for next releases:

  - Automated tests and builds
  - Improve and test the support for older versions

##Example of use

var doxygen = require('doxygen');

doxygen.installVersion(null, function () {

    doxygen.createConfig(
        {
            OUTPUT_DIRECTORY: "C:/DoxygenOutput",
            INPUT: "c:/MyProject",
            EXCLUDE: "c:/MyProject/node_modules"
        });
    doxygen.run();
});