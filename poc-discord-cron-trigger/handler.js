const https = require('https');
const httpCall = async (hostname, path) => {
  const options = {
    hostname,
    port: 443,
    path,
    method: 'GET',
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options);
    req.on('response', (res) => {
      resolve(res);
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
};
module.exports.handler = async () => {
  return await httpCall('localhost:3000', '/api/scripts/discordSyncJob');
};
