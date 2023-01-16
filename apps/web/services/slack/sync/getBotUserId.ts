import memoize from 'utilities/promises/memoize';
import { getSlackBot } from '../api';

const memoizedGetSlackBot = memoize(getSlackBot);

export async function getBotUserId(botId: string, token: string) {
  const bot = await memoizedGetSlackBot(botId, token);
  return bot.user_id;
}
