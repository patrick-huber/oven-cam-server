var express = require('express');
var router = express.Router();

var RaspiCam = require('raspicam');

// Setup new camera with options
var camera = new RaspiCam({ 
  mode: 'timelapse',
  output: './public/images/still.jpg',
  encoding: 'jpg',
  nopreview: true,
  timelapse: 1000,
  timeout: 0
});

function startCamera() {
  camera.start();
}
function stopCamera() {
  camera.stop();
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  var action = req.query.action;
  if(action === 'start') {
    camera.start();
  } else if(action === 'stop') {
    camera.stop();
  }
  res.send(200);
});

module.exports = router;
