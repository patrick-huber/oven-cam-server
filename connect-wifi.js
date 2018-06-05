var util = require('util');
var bleno = require('bleno');
var wifi = require('wifi-control');
var jsonfile = require('jsonfile');

const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'oven-cam',
  keyFilename: '/home/pi/oven-cam-server/oven-cam-keystore.json',
});

// Init wifi control
wifi.init();


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
};

EchoCharacteristicConnectWifi.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  var _this = this;
  var wifiCredentials = bytesToString(data).split(',');

  console.log('Wifi credentials received. Connecting to network: ' + wifiCredentials[0]);


  if (this._updateValueCallback) {
    console.log('EchoCharacteristicConnectWifi - onWriteRequest: notifying');
    this._updateValueCallback(this._value);
  }

  var network = {
    ssid: wifiCredentials[0],
    password: wifiCredentials[1]
  };

  wifi.connectToAP(network, function(err, response) {
    if (!err) { //Network created correctly
      console.log('connected!');

      // Write to firestore
      let collectionRef = firestore.collection('cameras');
      var cam_id = '';
      var battery_pct = 100;
      var charging_status = false;

      // Get camera power status from file
      var power_status = '/home/pi/oven-cam-server/power/power-status.json';
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
          var file = '/home/pi/oven-cam-server/status.json'
          var obj = {
            isSetup: true,
            id: cam_id
          }
          jsonfile.writeFile(file, obj, function (err) {
            // console.error(err);
          });

          _this._value = Buffer.from(cam_id, 'utf8');

          callback(_this.RESULT_SUCCESS);

          // Start express server
          var express_server = require('./bin/www');

        });
      });
    } else {
      console.log('Unable to connect to network');
      console.error(err);
      callback(_this.RESULT_UNLIKELY_ERROR);
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
