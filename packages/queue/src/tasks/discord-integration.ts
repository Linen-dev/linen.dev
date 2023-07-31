import type { JobHelpers } from 'graphile-worker';
import { getAllBots } from '@linen/web/config/discord';
import { cleanUpIntegrations } from '@linen/integration-discord';

export const discordIntegration = async (payload: any, helpers: JobHelpers) => {
  helpers.logger.info(JSON.stringify(payload));

  const bots = getAllBots();
  for (const bot of bots) {
    await cleanUpIntegrations(bot.PRIVATE_TOKEN, bot.botNum);
  }
};
