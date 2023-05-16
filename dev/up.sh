#!/bin/bash 
yarn build:deps
# Call func function on exit
trap func exit
# Declare the function
function func() {
  npx pm2 delete ecosystem.config.js
}

npx pm2 start ecosystem.config.js && npx pm2 logs
