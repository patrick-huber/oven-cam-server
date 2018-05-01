var util = require('util');
var bleno = require('bleno');
var wifi = require('pi-wifi');
var jsonfile = require('jsonfile');


var BlenoCharacteristic = bleno.Characteristic;

var EchoCharacteristicWifiNetworks = function(charUuid) {
  EchoCharacteristicWifiNetworks.super_.call(this, {
    uuid: charUuid,
    properties: ['notify'],
    value: null
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

// ASCII only
function bytesToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}


util.inherits(EchoCharacteristicWifiNetworks, BlenoCharacteristic);

EchoCharacteristicWifiNetworks.prototype.onReadRequest = function(offset, callback) {
  console.log('EchoCharacteristicWifiNetworks - onReadRequest: value = ' + bytesToString(this._value));

  callback(this.RESULT_SUCCESS, this._value);
};


EchoCharacteristicWifiNetworks.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('EchoCharacteristicWifiNetworks - onSubscribe');


  piWifi.scan(function(err, networks) {
    if (err) {
      return console.error(err.message);
    }
    console.log(networks);
    var networkSSID = []

    for (var i = networks.length - 1; i >= 0; i--) {
      networkSSID.push(networks[i]);
    }

    
  });
  

  this._updateValueCallback = networkSSID[0];
};

EchoCharacteristicWifiNetworks.prototype.onUnsubscribe = function() {
  console.log('EchoCharacteristicWifiNetworks - onUnsubscribe');

  this._updateValueCallback = null;
};

module.exports = EchoCharacteristicWifiNetworks;