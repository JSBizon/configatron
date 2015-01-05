var assert = require('assert');
var Config = require('../jsconfig');

//var config = new Config(['settings01.json'],{parser : "jsonInternal"});
var config = new Config(['settings02.json']);
config.on('ready',function(err,configObj,files){
	assert.ok( ! err, "Files not loaded: " + err);
	
//	assert.ok(configObj, "Config object not found");
});
