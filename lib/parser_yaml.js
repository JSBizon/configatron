"use strict";

var Parser = require('./parser'),
    YAML = require('js-yaml');

function YamlParser (options) {
    this._extensions = ['yml', 'yaml'];
    this._options = options || {};
}

YamlParser.prototype.listExtensions = function () {
    return this._extension;
};

YamlParser.prototype.parse = function (str) {
    return YAML.safeLoad(str,this._options);
};

module.exports = YamlParser;