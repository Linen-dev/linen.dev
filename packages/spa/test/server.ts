import express from 'express';
import { join } from 'path';
import { build } from '@linen/factory';
import { serializeAccount } from '@linen/serializers/account';
import { serializeChannel } from '@linen/serializers/channel';
import { serializeSettings } from '@linen/serializers/settings';

export default class Server {
  app: any;
  server: any;
  start({ port, statuses = { start: 200 } }): Promise<{ port: number }> {
    const community = build('account', { name: 'linen' });
    const permissions = build('permissions');
    const channels = [
      build('channel', {
        channelName: 'general',
        accountId: community.id,
        displayOrder: 0,
      }),
      build('channel', {
        channelName: 'issues',
        accountId: community.id,
        displayOrder: 1,
      }),
    ];
    this.app = express();
    this.app.use(express.static(join(__dirname, 'public')));
    this.app.use(express.static(join(__dirname, '../dist')));

    this.app.get('/api/spa/start', (_, response) => {
      setTimeout(() => {
        response.status(statuses.start || 200).json({
          channels: channels.map(serializeChannel),
          community: serializeAccount(community),
          permissions,
          settings: serializeSettings(community),
        });
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
      resolve(null);
    });
  }
}
