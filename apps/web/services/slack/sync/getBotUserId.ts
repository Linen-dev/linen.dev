import { getSlackBot } from '../api';

let botCache: Record<string, string> = {};
export async function getBotUserId(botId: string, token: string) {
  if (!botCache[botId]) {
    const bot = await getSlackBot(botId, token);
    botCache[botId] = bot.user_id;
  }
  return botCache[botId];
}
