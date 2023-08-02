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
import { Logger } from './utils/logger';

function initializeBot(botId: number, callback: () => void) {
  const logger = new Logger(botId, 'initializeBot', 'initialization');

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
    logger.info({ bot: 'Ready!' });
  });

  bot.on(Events.ShardDisconnect, () => {
    callback();
    process.exit(1);
  });

  bot.on(Events.Error, (error) => {
    logger.error({ error });
  });

  bot.on(Events.MessageCreate, onMessageCreate(botId));
  bot.on(Events.MessageDelete, onMessageDelete(botId));
  bot.on(Events.MessageUpdate, onMessageUpdate(botId));

  // bot.on(Events.MessageReactionAdd, onMessageReactionAdd);
  // bot.on(Events.MessageReactionRemove, onMessageReactionRemove);
  // bot.on(Events.MessageReactionRemoveAll, onMessageReactionRemoveAll);
  // bot.on(Events.MessageReactionRemoveEmoji, onMessageReactionRemoveEmoji);

  // bot.on(Events.ChannelCreate, onChannelCreate(botId));
  // bot.on(Events.ChannelUpdate, onChannelUpdate(botId));

  bot.on(Events.ThreadCreate, onThreadCreate(botId));
  bot.on(Events.ThreadUpdate, onThreadUpdate(botId));
  // bot.on(Events.ThreadDelete, onThreadDelete(botId));

  // bot.on(Events.UserUpdate, onUserUpdate(botId));

  // bot.on(Events.GuildMemberAdd, onGuildMemberAdd(botId));
  // bot.on(Events.GuildMemberRemove, onGuildMemberRemove(botId));
  // bot.on(Events.GuildMemberUpdate, onGuildMemberUpdate(botId));

  bot.login(getToken(botId));
}

export { initializeBot };
