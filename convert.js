//properties that end in _id are assumed to be oids
var _ = require('underscore');
var crypto = require("crypto");
var Converter = require("csvtojson").Converter;
var fs = require("fs");
var array_delim = '||'; //this is how you indicate arrays 
var salt = ''; //change or set this if you are converting datasets that may have ids that are the same. This will prevent hash id overlaps.
//Not perfect, I know - but this is ultimately on you.

function createUID(prop) {
    var uid = crypto.createHash('md5').update(prop + salt).digest('hex');
    return {'$oid': uid.substr(0,24)};
}

function csvToJson(json, filename) {
    _.map(json, function(obj) {
        _.map(obj, function(prop, key) {
            if (key.endsWith('_id') || key == '_id') {
                var new_id; 
                if (prop.indexOf(array_delim) > -1) {
                    new_id = [];
                    var ids = prop.split(array_delim);
                    ids.forEach(id =>   {
                        new_id.push(createUID(id));
                    });
                } else {
                    new_id = createUID(prop);
                }
                    obj[key] = new_id;
            }
        });
    });
    fs.writeFile('./output/' + filename + '.json', JSON.stringify(json));
}

fs.readdir('./input/', (err, files) => {
    files.forEach(file => {
        var converter = new Converter({});
        converter.fromFile('./input/' + file, (err, data) => {
            csvToJson(data, file.split(".")[0]);
        });
    });
});
