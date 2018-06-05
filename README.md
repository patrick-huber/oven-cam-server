# oven-cam-server

## main.js
Run main.js at launch in rc.local (make sure this comes before ``exit 0``). This will check the status of camera (status.json) and either run Bluetooth setup or Camera feed.
```
sudo node /home/pi/oven-cam-server/main.js &
```

## Bluetooth setup (ble.js)
Must be run as root (sudo). This is used to first connect to the oven camera to setup wifi and allow the client to connect to camera feed.

network-manager must be installed for wifi-control to work. Also need to disable wlan0 in ``/etc/network/interfaces``.

## Camera feed (app.js)
Uses node raspicam to capture pictures and express server to serve photos to client.

To run server:
```
DEBUG=myapp:* npm start
```

### Client
Navigate to:
http://10.0.0.31:3000/

## Pi power
Power and battery status are run via the power/pi_power.py script. This script needs to be run at launch in rc.local (make sure this comes before ``exit 0``).
```
/home/pi/oven-cam-server/power/pi_power.py &
```

Pi power source: https://github.com/craic/pi_power