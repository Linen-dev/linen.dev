#!/bin/bash 

# Call func function on exit
trap func exit
# Declare the function
function func() {
  yarn pm2 delete ecosystem.config.js
}

yarn pm2 start ecosystem.config.js && yarn pm2 logs bot