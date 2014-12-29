
/*
 * Simple ini file parser. 
 */

function simpleIniParse(source){
	var splitLines = source.split("\n");
	var section = '_';//default section name
	var result = {};
	if(section){
		result[section] = {};
	}
	
	if(splitLines){
		
		for(var i = 0; i < splitLines.length; i++){
			var line = splitLines[i],
				newSection,assignment,key,value;

			if(canIgnore(line)){
				continue;
			}
			
			preprocessLine(line);
			
			if(newSection = parseSectionHeader(line)){
				section = newSection;
				if(! result[section]){
					result[section] = {};
				}
			}
			else if(assignment = parseValueAssignment(line)){
				key = assignment[0];
				value = assignment[1];
				value.replace(/^"(.+)"$/,"$1");
				
				if(! section){
					throw{
						name:    'SyntaxError',
						message: "Section not defined",
						line: i+1
					}
				}else{
					result[section][key] = value;
				}
			}else{

				throw {
					name:    'SyntaxError',
					message: "Unexpected: '" + line + "'",
					line: i+1
				};
			}
		}
		
	}
	
	return result;
}

//match = /^\[([^\]]+)\]$/.exec(line)
function parseSectionHeader(line){
	var match;
	if(match = /^\s*\[\s*(.+?)\s*\]\s*$/.exec(line)){
		return match[1];
	}
}

//match = /^([\w\-]+) *= *("?(.+?) *"?)$/.exec(line)
function parseValueAssignment(line){
	var match;
	if(match = /^\s*([^=\s][^=]*?)\s*=\s*(.*?)\s*$/.exec(line)){
		return Array(match[1],match[2]);
	}
}

function preprocessLine(line){
	// Remove inline comments
	line.replace(/\s+;.*$/,'');
}

function canIgnore(line){
	return line.match(/^\s*(?:;|$)/) ? true : false;
}

module.exports = simpleIniParse;
