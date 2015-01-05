"use strict";

var Parser = require('./parser'),
    INI = require('ini');

function IniParser () {
    this._extensions = ['ini'];
}

IniParser.prototype.listExtensions = function () {
    return this._extension;
};

IniParser.prototype.parse = function (str) {
    return INI.parse(str);
};

module.exports = IniParser;