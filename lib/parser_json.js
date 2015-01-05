"use strict";

var Parser = require('./parser'),
     JSON = require('comment-json');

function JsonParser () {
    this._extensions = ['json'];
}

JsonParser.prototype.listExtensions = function () {
    return this._extension;
};

JsonParser.prototype.parse = function (str) {
    return JSON.parse(str);
};

module.exports = IniParser;