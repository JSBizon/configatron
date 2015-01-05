"use strict";

function Parser () { }

module.exports = Parser;

Parser.prototype.listExtensions = function () {
    throw new Error('listExtensions is not implemented');
};

Parser.prototype.parse = function (str) {
    throw new Error('parse is not implemented');
};