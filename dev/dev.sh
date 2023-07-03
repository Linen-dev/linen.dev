#!/bin/bash 
yarn build:deps
# Call func function on exit
trap func exit
# Declare the function
function func() {
  npx pm2 delete dev.config.js
}

npx pm2 start dev.config.js && npx pm2 logs
