"use strict";

var FS = require('fs'),
	EventEmitter = require('events').EventEmitter,
    UTIL = require('util'),
    Q = require('q'),
	Futures = require('futures'),
	IniParser = require('./parser_ini');

/*
var parsers = {
        "eval" : function(data, options){
            return eval('(' + data + ')');
        },
        "jsonParse" : function(data, options){
            if(options && options['handler']){
                return JSON.parse(data,options['handler']);
            }else{
                return JSON.parse(data);
            }
        },
        "json" : function(data,options){
            var json_parse = require('./json_parse');
            if(options && options['handler']){
                return json_parse(data,options['handler']);
            }else{
                return json_parse(data);
            }
        },
        "ini" : function(data,options){
            var ini_parse = require('./simple_ini_parse');
            return ini_parse(data);
        }
    };
*/

//var default_parsers = [IniParser, JsonParser, XmlParser, YamlParser];
var default_parsers = [IniParser];

function Configatron(files, options, defaults) {
    this._json = {};
    this._defaults = (defaults && typeof defaults === 'object') ? defaults : {};
    this._fileJson = {};
    this._files = [];
    this._parser_for_ext = {};
    var i = 0;
    
    this._options = extend({
        "parser" : null,//parser name or object
        "deepCopy" : true,
        "delimiter" : '.',
        'extensionParsers' : null,
        "throwNotKey" : false
    }, options);
    
    if (! this._options.extensionParsers) {
        //init default parsers
        for (i = 0; i < default_parsers.length; i++) {
            
        }
    }
    
    this.load(files, options);
};

util.inherits(Configatron, EventEmitter);


Configatron.prototype.load = function(files, options, cb) {
    
    if( ! files) {
        return;
    }
	
	var fn = arguments[arguments.length - 1];
	fn = (typeof(fn) === 'function' ? fn : noop);
	
	options = typeof(options) === 'object' ? options : {};
	options = extend({},this._options, options);
	
	
	if(!(files instanceof Array))
		files = [files];

	var join = Futures.join();
	for(var i in files){
		join.add(execute(fs.readFile,files[i],"utf8"));
	}

	var self = this;
	var resultFutures = Futures.future();
	//subscribe event emmiter
	resultFutures.when(function(){
		var args = Array.prototype.slice.call(arguments);
		args.unshift('ready');
		self.emit.apply(self, args);
	});
	
	if(fn){
		resultFutures.when(fn);
	}

	join.when(function(){
		var parsed = [], 
			error,data;
			parser = options['parser'],
			parserOptions = options['parserOptions'];
		
		if(typeof parser !== "function")
			parser = parsers[parser];
		
		if( ! parser){
			resultFutures.deliver("Unknow config parser");
			return;
		}
	
		for(var i = 0; i < arguments.length; i++){
			error = arguments[i][0];
			data = arguments[i][1];
		
			if(error){
				resultFutures.deliver(error);
				return;
			}
			try{
				parsed[i] = parser(data, parserOptions);
			}catch(catchedErr){
				resultFutures.deliver(catchedErr);
				return;
			}
		}
		if(options["reload"]){
			self._json = extend.apply(null, parsed);
			self._files = files;
		}else{
			parsed.unshift(self._json);
			self._json = extend.apply(null, parsed);
			self._files = self._files.concat(files);
		}
		resultFutures.deliver(null,self,files);
	});
	
	return resultFutures;
};


Configatron.prototype.loadSync = function(files,options){
	if( ! files){
		return;
	}
	
	options = typeof(options) === 'object' ? options : {};
	options = extend({},this._options, options);
	
	
	if(!(files instanceof Array))
		files = [files];
	
	var fileContent = [];
	for(var i in files){
		fileContent[i] = fs.readFileSync(files[i],"utf8");
	}
	
	var parsed = [], 
		parser = options['parser'],
		parserOptions = options['parserOptions'];
		
	if(typeof parser !== "function")
		parser = parsers[parser];
	
	if( ! parser){
		throw new Error("Unknow config parser");
	}
	
	for(var i in fileContent){
		var data = fileContent[i];
		parsed[i] = parser(data, parserOptions);
	}
	
	if(options["reload"]){
		this._json = extend.apply(null, parsed);
		this._files = files;
	}else{
		parsed.unshift(this._json);
		this._json = extend.apply(null, parsed);
		this._files = this._files.concat(files);
	}
};

/*
Config.prototype.reloadSync = function(){
	this.loadSync(this._files,{
		"reload" : true
	});
};


Config.prototype.reload = function(fn){
	var f = this.load(this._files,{
		"reload" : true
	},fn);
	return f;
};


Config.prototype.options = function(options){
	if(options){
		extend(this._options, options);
	}else{
		return this._options;
	}
};


Config.prototype.get = function(path,options){
	
	if(! path) return undefined;

	options = typeof(options) === 'object' ? options : {};
	options = extend({},this._options, options);
	
	var aPath = [];
	if( ! options['slashIgnore'] && typeof path.split === 'function'){
		aPath = path.split(options['delimiter']);
	}else{
		aPath = [path];
	}
	
	var value = this._json;
	var notFound = false;
	for(var i in aPath){
		var partPath = aPath[i];
		if(partPath in value){
			value = value[partPath];
		}else{
			notFound = true;
			break;
		}
	}
	if(notFound){
		//check in defaults
		notFound = false;
		value = this._defaults;
		for(var i in aPath){
			var partPath = aPath[i];
			if(partPath in value){
				value = value[partPath];
			}else{
				notFound = true;
				break;
			}
		}
	}
	
	if(notFound){
		if(options['throwNotKey'])
			throw Error('Key "' + path + '" not found');
		value = undefined;
	}
	
	if(value &&  typeof(value) === 'object' && options['deepCopy']){
		var copyValue = extend({}, value);
		return copyValue;
	}else{
		return value;
	}
};


Config.prototype.defaults = function(defaults){
	
	if(defaults && typeof defaults === 'object'){
		this._defaults = defaults;
	}
	
};



function execute(fn){
	var future = Futures.future();
	var args = Array.prototype.slice.call(arguments,1);
	args.push(future.deliver);
	fn.apply(null,args);
	return future;
}

function noop() {}

function extend(){
	var target = arguments[0] || {},
		length = arguments.length,
		options,src,copy,clone;

	for(var i = 1; i < length; i++){
		if ( (options = arguments[ i ]) != null ) {
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];
				if(target === copy){
					continue;
				}
				if(copy && typeof(copy) === 'object'){
					if(Array.isArray(copy)){
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && typeof(src) === 'object' ? src : {};
					}
				
					target[ name ] = extend(clone, copy );
				}else if(copy !== undefined){
					target[ name ] = copy;
				}
			}
		}
	}
	
	return target;
}
*/
//exports.extend = extend;

module.exports = Configatron;
