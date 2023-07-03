import env from './utils/config';
import { getToken } from './utils/token';
import {
  onChannelCreate,
  onChannelUpdate,
  onGuildMemberAdd,
  onGuildMemberRemove,
  onGuildMemberUpdate,
  onMessageCreate,
  onMessageDelete,
  onMessageReactionAdd,
  onMessageReactionRemove,
  onMessageReactionRemoveAll,
  onMessageReactionRemoveEmoji,
  onMessageUpdate,
  onThreadCreate,
  onThreadDelete,
  onThreadUpdate,
  onUserUpdate,
} from './discord';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { logger } from '@linen/logger';

function initializeBot(botId: number, callback: () => void) {
  const bot = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
    ],
  });

  bot.on(Events.ClientReady, () => {
    logger.info('Ready!', { bot: botId });
  });

  bot.on(Events.ShardDisconnect, () => {
    callback();
    process.exit(1);
  });

  bot.on(Events.Error, (err) => {
    logger.error(err);
  });

  bot.on(Events.MessageCreate, onMessageCreate);
  bot.on(Events.MessageDelete, onMessageDelete);
  bot.on(Events.MessageUpdate, onMessageUpdate);

  bot.on(Events.MessageReactionAdd, onMessageReactionAdd);
  bot.on(Events.MessageReactionRemove, onMessageReactionRemove);
  bot.on(Events.MessageReactionRemoveAll, onMessageReactionRemoveAll);
  bot.on(Events.MessageReactionRemoveEmoji, onMessageReactionRemoveEmoji);

  bot.on(Events.ChannelCreate, onChannelCreate);
  bot.on(Events.ChannelUpdate, onChannelUpdate);

  bot.on(Events.ThreadCreate, onThreadCreate);
  bot.on(Events.ThreadDelete, onThreadDelete);
  bot.on(Events.ThreadUpdate, onThreadUpdate);

  bot.on(Events.UserUpdate, onUserUpdate);

  bot.on(Events.GuildMemberAdd, onGuildMemberAdd);
  bot.on(Events.GuildMemberRemove, onGuildMemberRemove);
  bot.on(Events.GuildMemberUpdate, onGuildMemberUpdate);

  bot.login(getToken(botId));
}

export { initializeBot };
