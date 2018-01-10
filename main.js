var jsonfile = require('jsonfile');

var file = './status.json';

jsonfile.readFile(file, function(err, obj) {
  console.dir(obj.isSetup)
  if(obj.isSetup) {
    // Camera already setup
    var express_server = require('./bin/www');
  } else {
    // Turn on bluetooth for setup
    var ble_server = require('./ble.js');
  }
})