//properties that end in _id are assumed to be oids
var _ = require('underscore');
var crypto = require("crypto");
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var fs = require("fs");
var filename = 'objectA';
var salt = ''; //change or set this if you are converting datasets that may have ids that are the same. This will prevent hash id overlaps.
//Not perfect, I know - but this is ultimately on you.

function csvToJson(json, filename) {
    _.map(json, function(obj) {
        _.map(obj, function(prop, key) {
            if (key.endsWith('_id') || key == '_id') {
                var new_id = crypto.createHash('md5').update(prop + salt).digest('hex');
                obj[key] = {'$oid': new_id.substr(0,24)};
            }
        });
    });
    fs.writeFile('./output/' + filename + '.json', JSON.stringify(json));
}

fs.readdir('./input/', (err, files) => {
    files.forEach(file => {
        converter.fromFile('./input/' + file, (err, data) => {
            csvToJson(data, file.split(".")[0]);
        });
    });
});
