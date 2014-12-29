//var assert = require('assert'),
var	Config = require('../jsconfig'),
	should = require('should');

module.exports = {
	"test extend" : function(){
		if(Config.extend){
			var test01 = {
				't1' : {
					'v02' : 'x'
				},
				't2' : 'val2'
			};
		
			var test02 = {
				't1' : {
					'v01' : ['c1','c2']
				},
				't2' : 'val_test02'
			};
		
			var ext = jsconfig.extend(test01,test02);
			ext.should.have.property('t2', 'val_test02');
			ext.should.not.include.object({'t1' : { 'v02' : 'x' }});
		}
	},
	
	"test constructor event loader" : function(beforeExit){
		var loaded = false;
		
		var config = new Config([__dirname + '/settings01.json', __dirname + '/settings02.json']);
		config.on('ready',function(err,configObj,files){
			loaded = true;
			
			should.not.exist(err);
			should.exist(configObj);
			should.exist(files);
			configObj.should.be.an.instanceof(Config);
			files.should.be.an.instanceof(Array).lengthOf(2);
			config.get("w").should.eql('settings02');
		});
		
		beforeExit(function(){
			loaded.should.be.true;
		});
	},
	
	"test load config callback" : function(beforeExit){
		var loaded = false;
		
		var config = new Config();
		config.load(__dirname + '/settings01.json',function(err,configObj,files){
			loaded = true;
			
			should.not.exist(err);
			should.exist(configObj);
			should.exist(files);
			configObj.should.be.an.instanceof(Config);
			files.should.be.an.instanceof(Array).lengthOf(1);
		});
		
		beforeExit(function(){
			loaded.should.be.true;
		});
	},
	
	"test load config feature" : function(beforeExit){
		var loaded = false;
		
		var config = new Config();
		config.load(__dirname + '/settings01.json').when(function(err,configObj,files){
			should.not.exist(err);
			should.exist(configObj);
			should.exist(files);
			configObj.should.be.an.instanceof(Config);
			files.should.be.an.instanceof(Array).lengthOf(1);
			
			config.load(__dirname + '/settings02.json').when(function(err,configObj,files){
				loaded = true;
				
				should.not.exist(err);
				should.exist(configObj);
				should.exist(files);
				configObj.should.be.an.instanceof(Config);
				files.should.be.an.instanceof(Array).lengthOf(1);
				config.get("w").should.eql('settings02');
			});
		});
		
		beforeExit(function(){
			loaded.should.be.true;
		});
	},
	
	"test load Sync" : function(){
		var config = new Config();
		config.loadSync(__dirname + '/settings01.json');
		
		should.throws(function(){
			config.loadSync(__dirname + '/settings.ini');
		});
		
		config.get("w").should.eql('settings01');
	},
	
	"test eval parser" : function(beforeExit){
		var loaded = false;
		var config = new Config([__dirname + '/settings01.json',__dirname + '/settings02.json'],{
			'parser' : 'eval'
		});
		
		config.on('ready', function(err,config,files){
			loaded = true;
			
			should.not.exist(err);
			should.exist(config);
			config.get("w").should.eql('settings02');
		});
		
		beforeExit(function(){
			loaded.should.be.true;
		});
	},
	
	"test JSON.parse" : function(beforeExit){
		var loaded = false;
		
		new Config()
		.load([__dirname + '/settings01.json'],{parser : 'jsonParse'})
		.when(function(err,config,files){

			
			should.not.exist(err);
			
			//should be error - standart parser have not able parse comments
			config.load([__dirname + '/settings02.json'],{parser : 'jsonParse'})
			.when(function(err){
				loaded = true;
				
				should.exist(err);
				
				config.get("w").should.eql('settings01');
			});
		});
		
		beforeExit(function(){
			loaded.should.be.true;
		});
		
	},
	
	"test ini parse" : function(beforeExit){
		var loaded = false;
		
		//should.ok(null);
		
		new Config()
		.load([__dirname + '/settings.ini'],{'parser' : 'ini'})
		.when(function(err,config){
			loaded = true;
			
			should.not.exist(err);
			should.exist(config);
			config.get("section1.key1").should.eql('value1');
			config.get("_.key0").should.eql('value0');
			config.get("section2.key2").should.eql('value2');
			
		});
		
		beforeExit(function(){
			loaded.should.be.true;
		});
	},
	
	"test external custom parse" : function(beforeExit){
		var loaded = false;
		
		var config = new Config(__dirname + '/settings01.json',{
			'parser' : function(content){
				//there is no really parser simple return fake structure
				return {
					'key1' : 'value1',
					'key2' : {
						'key22' : [0,1,2,3,4]
						}
					}
			}
		});
		
		config.on('ready',function(err){
			loaded = true;
			
			should.not.exist(err);
			config.get("key2.key22.2").should.eql(2);
		});
		
		beforeExit(function(){
			loaded.should.be.true;
		});
	},
	
	"test reload" : function(beforeExit){
		var loaded = false;
		
		var config = new Config();
		config.load(__dirname + '/settings01.json').when(function(err){
			should.not.exist(err);
			var feature = config.reload();
			feature.when(function(err){
				loaded = true;
				
				should.not.exist(err);
				config.get("z.2").should.eql('c');
			});
		});
		
		beforeExit(function(){
			loaded.should.be.true;
		});
	},
	
	"test get" : function(beforeExit){
		var loaded = false;
		
		var config = new Config();
		config.load([__dirname + '/settings01.json',__dirname + '/settings02.json']).when(function(err){
			should.not.exist(err);
			config.load(__dirname + '/settings.ini', {'parser' :'ini'}).when(function(err){
				loaded = true;
				should.not.exist(err);
				config.get("z.2").should.eql('c');
				config.get("z/2",{'delimiter' : '/'}).should.eql('c');
				config.get('key').should.eql(
					{
						"key2" : "value2",
						"key3" : "value3"
					}
				);
				var h = config.get('key');
				
				h['key2'] = 'newvalue';
				
				//console.log(config.get('key.key2'));
				config.get("key.key2").should.eql('value2');
				
				//get ref to the real value
				h = config.get('key',{'deepCopy' : false});
				h['key2'] = 'newvalue';
				config.get("key.key2").should.eql('newvalue');
				
			});
		});
		
		beforeExit(function(){
			loaded.should.be.true;
		});
	},
	
	"test defaults" : function(beforeExit){
		var loaded = false;
		
		var config = new Config();
		config.defaults({
			'def' : "value"
		});
		
		config.load([__dirname + '/settings01.json']).when(function(err){
			loaded = true;
			should.not.exist(err);
			config.get("def").should.eql('value');
		});
		
		beforeExit(function(){
			loaded.should.be.true;
		});
	},
	
	"test options" : function(){
		var config = new Config();
		config.options({
			'parser' : "ini",
			'delimiter' : '/'
		});

		config.load([__dirname + '/settings.ini']).when(function(err){
			should.not.exist(err);
			config.get("section1/key1").should.eql('value1');
		});
	}
};
