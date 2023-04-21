import { promiseMemoize } from '@linen/utilities/memoize';
import { getSlackBot } from '../api';

const memoizedGetSlackBot = promiseMemoize(getSlackBot);

export async function getBotUserId(botId: string, token: string) {
  const bot = await memoizedGetSlackBot(botId, token);
  return bot.user_id;
}
