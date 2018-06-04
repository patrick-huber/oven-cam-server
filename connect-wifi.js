var util = require('util');
var bleno = require('bleno');
var wifi = require('pi-wifi');
var os = require('os');
var jsonfile = require('jsonfile');

const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'oven-cam',
  keyFilename: './oven-cam-keystore.json',
});


var BlenoCharacteristic = bleno.Characteristic;

var EchoCharacteristicConnectWifi = function(charUuid) {
  EchoCharacteristicConnectWifi.super_.call(this, {
    uuid: charUuid,
    properties: ['read','write','notify'],
    value: 0
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

// ASCII only
function bytesToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}


util.inherits(EchoCharacteristicConnectWifi, BlenoCharacteristic);

EchoCharacteristicConnectWifi.prototype.onReadRequest = function(offset, callback) {
  console.log('EchoCharacteristicConnectWifi - onReadRequest: value = ' + bytesToString(this._value));

  callback(this.RESULT_SUCCESS, this._value);

  // Only after sending back cam_id, then we close out the bluetooth connection
  // Start express server
  var express_server = require('./bin/www');

  process.exit();
};

EchoCharacteristicConnectWifi.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  
  var wifiCredentials = bytesToString(data).split(',');

  console.log('EchoCharacteristicConnectWifi - onWriteRequest: value = ' + bytesToString(this._value));



  if (this._updateValueCallback) {
    console.log('EchoCharacteristicConnectWifi - onWriteRequest: notifying');
    this._updateValueCallback(this._value);
  }

  // Mock function to run without configuring wifi
  // var connect_wifi = 'success';
  // var connect_wifi = 'fail';

  // Temp variables for testing
  // var ssid = wifiCredentials[0];
//  var status[ip] = '10.0.0.59';

  var network = {
    ssid: wifiCredentials[0],
    password: wifiCredentials[1]
  };

  wifi.connectTo(network, function(err) {
    if (!err) { //Network created correctly
      console.log('connected! getting ip...');

      var ip_address = '';
      var checkAddresses = setInterval(function(){
        console.log('checking for ip...');
        var interfaces = os.networkInterfaces();
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                  console.log('address found! ' + address.address);
                    ip_address = address.address;
                    clearInterval(checkAddresses);
                    dbWrite();
                }
            }
        }
      }, 2000);

      console.log('Connected to the network!');

      function dbWrite() {

        // Write to firestore
        let collectionRef = firestore.collection('cameras');
        var cam_id = '';
        var battery_pct = 100;
        var charging_status = false;

        // Get camera power status from file
        var power_status = './power/power-status.json';
        jsonfile.readFile(power_status, function(err, power_obj) {
          if(!err) {
            console.log('setting values from json');
            // try to update camera power after reading json file
            battery_pct = Math.round(power_obj.battery_percent * 100);
            charging_status = (power_obj.power_source === 'usb') ? true : false;
          }
          // Add new camera document and return document id
          collectionRef.add({
            battery_level: battery_pct,
            charging: charging_status,
            local_ip: ip_address + ':3000', // Don't forget to add 3000 port on the express server
            name: 'Oven cam',
            status: 'online'
          }).then(documentReference => {  
            // Todo: need to send back cam_id to client
            cam_id = documentReference.id;
            console.log(`New document id: ${cam_id}`);

            // Update status json file so we don't run setup again
            var file = './status.json'
            var obj = {
              isSetup: true,
              id: cam_id
            }
            jsonfile.writeFile(file, obj, function (err) {
              // console.error(err);
            });

            callback(this.RESULT_SUCCESS);
            this._value = Buffer.from(cam_id, 'utf8');
          });

        });

      }
      
      
      
    } else {
      console.log('Unable to create the network');
      console.error(err.message);
      callback(false);
    }
  });

  // Legacy wifi connect. Remove after checking wifi.connectTo function above
  // wifi.connect(wifiCredentials[0], wifiCredentials[1], function(err) {
  //   if (err) {
  //     console.error(err.message);
  //     callback(false);
  //   }
  //   console.log('Successful connection!');
  //   callback(this.RESULT_SUCCESS);
  //   this._value = data;
  // });

  
};

EchoCharacteristicConnectWifi.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('EchoCharacteristicConnectWifi - onSubscribe');

  

  this._updateValueCallback = updateValueCallback;
};

EchoCharacteristicConnectWifi.prototype.onUnsubscribe = function() {
  console.log('EchoCharacteristicConnectWifi - onUnsubscribe');

  this._updateValueCallback = null;
};

module.exports = EchoCharacteristicConnectWifi;
