import type { JobHelpers } from 'graphile-worker';
import { getAllBots } from '@linen/web/config/discord';
import { cleanUpIntegrations } from '@linen/integration-discord';
import { Logger } from '../helpers/logger';

export const discordIntegration = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);

  logger.info(payload);

  const bots = getAllBots();
  for (const bot of bots) {
    await cleanUpIntegrations(bot.PRIVATE_TOKEN, bot.botNum, logger);
  }
};
