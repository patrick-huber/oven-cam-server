#!/bin/sh
# Oven cam reset
# Resets oven cam back to factory settings

# Remove from Firestore - also resets status.json
node /home/pi/oven-cam-server/firestore

# Reset wifi settings
sudo rm -rf /etc/NetworkManager/system-connections/*

# Reboot
sudo shutdown -r