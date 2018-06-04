var jsonfile = require('jsonfile');

var status = '/home/pi/oven-cam-server/status.json';
jsonfile.readFile(status, function(err, obj) {
  if(!err && obj.isSetup) {
    // Setup complete. Run express
    var express = require('./bin/www');
  } else {
    var setup = require('./ble');
  }
});