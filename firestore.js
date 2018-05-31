const Firestore = require('@google-cloud/firestore');
var jsonfile = require('jsonfile');
var fs = require('fs');
var ip = require('./local_ip');

const firestore = new Firestore({
  projectId: 'oven-cam',
  keyFilename: './oven-cam-keystore.json',
});

var cam_id = '';
var status_file = './status.json';
var power_file = './power/power-status.json';
var battery_pct;
var charging_status;
var current_ip;

// On first run get current ip in case router changed it since last boot
ip.data.current.then(function(address) {
  current_ip = address;
  // Run only after gettting IP since that can take a bit
  jsonfile.readFile(status_file, function(err, status_obj) {
    if(!err) {
      // Get camera document id that was written to status.json during setup
      cam_id = status_obj.id;

      const document = firestore.doc('cameras/' + cam_id);

      fs.watchFile(power_file, () => {

        console.log('power file changed');
        // Get latest power info
        jsonfile.readFile(power_file, function(err, power_obj) {
          if(!err) {
            battery_pct = Math.round(power_obj.battery_percent * 100);
            charging_status = (power_obj.power_source === 'usb') ? true : false;

            // Update firestore with latest power info
            document.update({
              battery_level: battery_pct,
              charging: charging_status,
              local_ip: current_ip,
              status: 'online' // status is online since script is running on cam
            }).then(() => {
              // Document updated successfully.
              console.log('power status updated.');
            });
          }
        });
      }, 1000);
    }
  });
});

function writeFirestore() {
  // First get camera document id that was written to status.json during setup
  jsonfile.readFile(status_file, function(err, status_obj) {
    if(!err) {
      cam_id = status_obj.id;

      const document = firestore.doc('cameras/' + cam_id);

      fs.watchFile(power_file, () => {

        console.log('power file changed');
        // Get latest power info
        jsonfile.readFile(power_file, function(err, power_obj) {
          if(!err) {
            battery_pct = Math.round(power_obj.battery_percent * 100);
            charging_status = (power_obj.power_source === 'usb') ? true : false;

            // Update firestore with latest power info
            document.update({
              battery_level: battery_pct,
              charging: charging_status,
              local_ip: ip,
              status: 'online' // status is online since script is running on cam
            }).then(() => {
              // Document updated successfully.
              console.log('power status updated.');
            });
          }
        });
      }, 1000);
    }
  });
}




