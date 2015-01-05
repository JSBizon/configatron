var fs = require('fs');
var et = require('elementtree');

var doc = '<xml xmlns="a" xmlns:c="./lite">\n'+
        '\t<child>test</child>\n'+
        '\t<child></child>\n'+
        '\t<child/>\n'+
    '</xml>';


/*
var XML = et.XML;
var ElementTree = et.ElementTree;
var element = et.Element;
var subElement = et.SubElement;
*/

var data, etree;

//data = fs.readFileSync('document.xml').toString();
data = doc;
etree = et.parse(data);

console.log(etree);
/*
console.log(etree.findall('./entry/TenantId').length); // 2
console.log(etree.findtext('./entry/ServiceName')); // MaaS
console.log(etree.findall('./entry/category')[0].get('term')); // monitoring.entity.create
*/