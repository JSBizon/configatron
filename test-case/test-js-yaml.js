var yaml = require('js-yaml'),
    fs   = require('fs');

try {
    var doc = yaml.safeLoad(fs.readFileSync('./database.yml', 'utf8'));
    console.log(doc);
} catch (e) {
    console.log(e);
}