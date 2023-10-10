const express = require('express');
const { join } = require('path');

class Server {
  constructor() {}
  start({ port, statuses = {} }) {
    this.app = express();
    this.app.use(express.static(join(__dirname, 'public')));
    this.app.use(express.static(join(__dirname, '../dist')));

    this.app.get('/api/spa/start', (_, response) => {
      setTimeout(() => {
        response.status(statuses.start || 200).json({});
      }, 200);
    });

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, (error) => {
        if (error) {
          return reject();
        }
        const address = this.server.address();
        if (process.env.NODE_ENV === 'development') {
          console.log(`spa development server started on port ${address.port}`);
        }
        return resolve({ port: address.port });
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      const address = this.server.address();
      // we're not waiting for the server to close
      // we want specs to end faster
      this.server.close();
      if (process.env.NODE_ENV === 'development') {
        console.log(`spa development server stopped on port ${address.port}`);
      }
      resolve();
    });
  }
}

module.exports = Server;
