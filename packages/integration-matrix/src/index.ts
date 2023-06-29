import {
  Cli,
  Bridge,
  AppServiceRegistration,
  Logger,
  LogLevel,
} from 'matrix-appservice-bridge';
import express, { Request } from 'express';
import LinenSdk from '@linen/sdk';
import { IConfig } from './IConfig';
import { ILinenMatrixPayload } from './ILinenMatrixPayload';
import { handleLinenEvent } from './handleLinenEvent';
import { handleMatrixEvent } from './handleMatrixEvent';
import { authorizationMiddleware } from './authorizationMiddleware';

Logger.configure({ console: (process.env.LOG || 'info') as LogLevel });
const log = new Logger('linen-bridge:main');

const registrationFile = `linen-registration.yaml`;

const cli = new Cli({
  registrationPath: registrationFile,
  generateRegistration: function (reg, callback) {
    const config = cli.getConfig() as IConfig | null;
    if (!config) {
      throw Error('Config not ready');
    }
    reg.setId(AppServiceRegistration.generateToken());
    reg.setHomeserverToken(AppServiceRegistration.generateToken());
    reg.setAppServiceToken(AppServiceRegistration.generateToken());
    reg.setSenderLocalpart('linen');
    reg.addRegexPattern('users', `@linen_*.*:${config.matrix.domain}`, true);
    reg.addRegexPattern('aliases', `#*.*:${config.matrix.domain}`, false);
    callback(reg);
  },
  bridgeConfig: { defaults: {}, schema: 'config.yaml' },
  run: (_, rawConfig, registration) => {
    const config = rawConfig as IConfig | null;
    if (!config) {
      throw Error('Config not ready');
    }
    if (!registration) {
      throw Error('registration must be defined');
    }
    log.debug(config);
    log.debug(registration);

    const linenSdk = new LinenSdk({
      apiKey: config.linen.apikey,
      ...(!!config.linen.domain
        ? {
            linenUrl: config.linen.domain,
          }
        : {}),
    });

    const bridge = new Bridge({
      homeserverUrl: config.matrix.homeserverUrl,
      domain: config.matrix.domain,
      registration: registrationFile,
      controller: {
        onUserQuery: function (queriedUser) {
          return {}; // auto-provision users with no additional data
        },

        onEvent: async function (request, context) {
          const event = request.getData();
          const accountId = await whoAmI(linenSdk);
          await handleMatrixEvent({
            event,
            bridge,
            linenSdk,
            registration,
            accountId,
          });
          return;
        },
      },
    });

    const app = express();
    app.use(express.json());
    app.use(authorizationMiddleware(config));

    app.all('*', async (req: Request<any, any, ILinenMatrixPayload>, res) => {
      const { status, ...rest } = await handleLinenEvent({
        bridge,
        config,
        body: req.body,
      });
      res.status(status).json(rest);
    });

    app.listen(config.webhook.port, () => {
      log.debug('Linen-side listening on port', config.webhook.port);
    });

    bridge.run(config.bridge.port);
    log.debug('Matrix-side listening on port', config.bridge.port);
  },
});

cli.run();

async function whoAmI(linenSdk: LinenSdk) {
  const whoAmI = await linenSdk.whoAmI();
  if (!whoAmI?.accountId) {
    throw Error('invalid linen token');
  }
  return whoAmI.accountId;
}
