const https = require('https');
module.exports.handler = async () => {
  return await new Promise((res, rej) => {
    https
      .get(
        `https://${process.env.SYNC_URL}/api/scripts/discordSyncJob`,
        (resp) => {
          let data = '';
          resp.on('data', (chunk) => {
            data += chunk;
          });
          resp.on('end', () => {
            console.log(data);
            res(data);
          });
        }
      )
      .on('error', (err) => {
        console.log('Error: ' + err.message);
        rej(err);
      });
  });
};
