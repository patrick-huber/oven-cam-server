var util = require('util');

var bleno = require('bleno');

var wifi = require('pi-wifi');


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

  var connect_wifi = 'success';

  if (connect_wifi === 'success') {
    console.log('Successful connection!');
    callback(this.RESULT_SUCCESS);
    this._value = data;
  }

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