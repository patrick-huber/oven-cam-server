var os = require('os');

var methods = {
  current: x()
}

function x() {
  var promise = new Promise(function(resolve, reject) {
    var checkAddresses = setInterval(function(){
      var interfaces = os.networkInterfaces();
      for (var k in interfaces) {
          for (var k2 in interfaces[k]) {
              var address = interfaces[k][k2];
              if (address.family === 'IPv4' && !address.internal) {
                  ip_address = address.address;
                  clearInterval(checkAddresses);
                  resolve(ip_address);
              }
          }
      }
    }, 1000);
  });
  return promise;
}

exports.data = methods;