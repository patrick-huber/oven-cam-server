var util = require('util');

var bleno = require('bleno');

var piWifi = require('pi-wifi');


var BlenoCharacteristic = bleno.Characteristic;

var EchoCharacteristic = function(charUuid) {

  EchoCharacteristic.super_.call(this, {
    uuid: charUuid,
    properties: ['read']
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

// ASCII only
function stringToBytes(string) {
 var array = new Uint8Array(string.length);
 for (var i = 0, l = string.length; i < l; i++) {
     array[i] = string.charCodeAt(i);
  }
  return array.buffer;
}
function bytesToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}


util.inherits(EchoCharacteristic, BlenoCharacteristic);

EchoCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('EchoCharacteristic - onReadRequest: value = ' + bytesToString(this._value));

  var result = this.RESULT_SUCCESS;
  var names = '';

  // Todo: Need to find a way to send available networks to client
  piWifi.scan(function(err, networksArray) {
    var networkNames = [];
    if (err) {
      return console.error(err.message);
    } else {
      console.log('networks found');
    }
    networksArray.forEach(function (currentNetwork) {
      if(currentNetwork.ssid) {
        networkNames.push(currentNetwork.ssid);
        console.log('currentNetwork: ' + currentNetwork.ssid);
      }
    });

    names = networkNames.join();
    namesBuffer = stringToBytes(names);

    var namesLength = namesBuffer.byteLength
    i = 0;

    // if(namesLength > 20) {
    //   console.log('too long');
    //   while(i < 50) {
    //     console.log(i)
    //     // callback(result, new Buffer(namesBuffer.slice(0, 19)));
    //     callback(result, new Buffer(namesBuffer.slice(i, i+19)));
    //     // namesLength = namesLength - 20;
    //     i = i+19;
    //   }
    // } else {
    //   callback(result, namesBuffer);
    // }

      callback(result, namesBuffer);
  });

  
};

EchoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  // this._value = data;

  piWifi.scan(function(err, networksArray) {
    var networkNames = [];
    if (err) {
      return console.error(err.message);
    } else {
      console.log('networks found');
    }
    networksArray.forEach(function (currentNetwork) {
      networkNames.push(currentNetwork.ssid);
      // console.log('currentNetwork: ' + currentNetwork.ssid);
    });

    this._value = stringToBytes(networkNames.join());
    console.log('all network names: ' + networkNames.join())

    if (this._updateValueCallback) {
      this._updateValueCallback(this._value);
    }
    
    callback(this._value);
  });

  // callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('EchoCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

EchoCharacteristic.prototype.onUnsubscribe = function() {
  console.log('EchoCharacteristic - onUnsubscribe');

  this._updateValueCallback = null;
};

module.exports = EchoCharacteristic;