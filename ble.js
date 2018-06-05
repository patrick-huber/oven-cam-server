var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;

// var EchoCharacteristic = require('./characteristic');
var EchoCharacteristicConnectWifi = require('./connect-wifi');

console.log('bleno - oven-cam');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('oven-cam', ['a018']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: 'a018',
        characteristics: [
          // new EchoCharacteristic('ec00'), // Todo: use this characteristic to get available networks
          new EchoCharacteristicConnectWifi('ec01')
        ]
      })
    ]);
  }
});

bleno.on('servicesSet', function(error){
  console.log('Some services set!')
  // console.log(BlenoPrimaryService);
});
