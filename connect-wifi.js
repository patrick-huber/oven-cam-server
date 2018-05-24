var util = require('util');
var bleno = require('bleno');
var wifi = require('pi-wifi');
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
};

EchoCharacteristicConnectWifi.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  
  var wifiCredentials = bytesToString(data).split(',');

  console.log('EchoCharacteristicConnectWifi - onWriteRequest: value = ' + bytesToString(this._value));



  if (this._updateValueCallback) {
    console.log('EchoCharacteristicConnectWifi - onWriteRequest: notifying');
    this._updateValueCallback(this._value);
  }

  // Mock function to run without configuring wifi
  var connect_wifi = 'success';
  // var connect_wifi = 'fail';

  // Temp variables for testing
  var ssid = wifiCredentials[0];
//  var status[ip] = '10.0.0.59';


  if (connect_wifi === 'success') {
    console.log('Connected to the network ' + ssid);
    
    // Write to firestore
    var cam_id = '';

    let collectionRef = firestore.collection('cameras');

    // Add new camera document and return document id
    collectionRef.add({
      battery_level: 100, // Todo: need to get from pi-power
      charging: false, // Todo: need to get from pi-power
      local_ip: '10.0.0.59' + ':3000', // Don't forget to add 3000 port on the express server
      name: 'Oven cam',
      status: 'online'
    }).then(documentReference => {  
      // Todo: need to send back cam_id to client
      cam_id = documentReference.id;
      console.log(`New document id: ${cam_id}`);
    });

    // Update status json file so we don't run setup again
    var file = './status.json'
    var obj = {isSetup: true}
    jsonfile.writeFile(file, obj, function (err) {
      // console.error(err);
    });

    callback(this.RESULT_SUCCESS);
    this._value = data;

    // Start express server
    var express_server = require('./bin/www');
  }

  var network = {
    ssid: wifiCredentials[0],
    password: wifiCredentials[1]
  };
  /*
  wifi.connectTo(network, function(err) {
    if (!err) { //Network created correctly
      setTimeout(function () {
        wifi.check(ssid, function (err, status) {
          if (!err && status.connected) {
            console.log('Connected to the network ' + ssid + '! IP: ' + status.ip);
            
            // Write to firestore
            var cam_id = '';

            let collectionRef = firestore.collection('cameras');

            // Add new camera document and return document id
            collectionRef.add({
              battery_level: 100, // Todo: need to get from pi-power
              charging: false, // Todo: need to get from pi-power
              local_ip: status.ip + ':3000', // Don't forget to add 3000 port on the express server
              name: 'Oven cam',
              status: 'online'
            }).then(documentReference => {  
              // Todo: need to send back cam_id to client
              cam_id = documentReference.id;
              console.log(`New document id: ${cam_id}`);
            });

            // Update status json file so we don't run setup again
            var file = './status.json'
            var obj = {isSetup: true}
            jsonfile.writeFile(file, obj, function (err) {
              // console.error(err);
            });

            callback(this.RESULT_SUCCESS);
            this._value = data;

            // Start express server
            var express_server = require('./bin/www');
          } else {
            console.log('Unable to connect to the network ' + ssid + '!');
            console.error(err.message);
            callback(false);
          }
        });
      }, 2000);
    } else {
      console.log('Unable to create the network ' + ssid + '.');
      console.error(err.message);
      callback(false);
    }
  });
  */

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
