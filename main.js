var jsonfile = require('jsonfile');

var status = '/home/pi/oven-cam-server/status.json';
jsonfile.readFile(status, function(err, obj) {
  var setup = require('./ble');
  if(!err && obj.isSetup) {
    // Setup complete. Run express
    var express = require('./bin/www');
  }
});