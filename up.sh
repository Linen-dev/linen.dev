#!/bin/bash 

# Call func function on exit
trap func exit
# Declare the function
function func() {
  pm2 delete ecosystem.config.js
}

pm2 start ecosystem.config.js && pm2 logs