const Firestore = require('@google-cloud/firestore');
var jsonfile = require('jsonfile');
var fs = require('fs');
var ip = require('./local_ip');

const firestore = new Firestore({
  projectId: 'oven-cam',
  keyFilename: './oven-cam-keystore.json',
});

var newData = {}

var status_file = './status.json';
var power_file = './power/power-status.json';

// Get camera id right away and setup firestore camera document
jsonfile.readFile(status_file, function(err, status_obj) {
  if(!err) {
    // Get camera document id that was written to status.json during setup
    var cam_id = status_obj.id;

    const document = firestore.doc('cameras/' + cam_id);

    setIp(document);
    watchPower(document);
  }
});

function setIp(camDoc) {
  console.log('setIp');
  // On first run get current ip in case router changed it since last boot
  ip.data.current.then(function(address) {
    newData["local_ip"] = address + ':3000';
    updateDocument(camDoc,newData);
  });
}

function getPowerStatus() {
  console.log('getPowerStatus');
  var promise = new Promise(function(resolve, reject) {
    // Get latest power info
    jsonfile.readFile(power_file, function(err, power_obj) {
      if(!err) {
        console.log('read power file');
        newData["battery_level"] = Math.round(power_obj.battery_percent * 100);
        newData["charging"] = (power_obj.power_source === 'usb') ? true : false;
        newData["status"] = power_obj.status;
        resolve(newData);
      }
    });
  });
  return promise;
}

function watchPower(camDoc) {
  // Get power status rigth away
  getPowerStatus().then(function(newObj) {
    updateDocument(camDoc,newObj);
  });
  // Watch for future changes
  fs.watchFile(power_file, () => {
    console.log('power file updated');
    getPowerStatus().then(function(newObj) {
      updateDocument(camDoc,newObj);
    });
  });
}

// Update camera document with new object data
function updateDocument(doc,docObj) {
  doc.update(docObj).then(() => {
    // Document updated successfully.
    console.log('Camera document updated.');
  });
}




