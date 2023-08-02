import { discordAuthorizations } from '@linen/database';
import env from './config';

export const getTokenByIntegration = (integration: discordAuthorizations) => {
  if (!integration.customBot) {
    return getToken(1);
  }
  if (integration.scope === 'linen-bot-1') {
    return getToken(1);
  }
  if (integration.scope === 'linen-bot-2') {
    return getToken(2);
  }

  throw 'customer custom bot';
};

export const getToken = (bot: number) => {
  switch (bot) {
    case 2:
      return env.DISCORD_TOKEN_2;
    case 1:
    default:
      return env.DISCORD_TOKEN;
  }
};
