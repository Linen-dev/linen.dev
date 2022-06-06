import { sleep } from '../../utilities/retryPromises';
import request from 'superagent';
import { DISCORD_TOKEN, SECONDS } from './constrains';

export async function getDiscordWithRetry({
  path,
  query = {},
}: {
  path: string;
  query?: any;
}): Promise<any> {
  try {
    const response = await getDiscord({ path, query });
    const rateLimit = {
      limit: Number(response.headers['x-ratelimit-limit']),
      remaining: Number(response.headers['x-ratelimit-remaining']),
      reset: Number(response.headers['x-ratelimit-reset']),
      resetAfter: Number(response.headers['x-ratelimit-reset-after']),
    };
    if (rateLimit.remaining === 0) {
      console.warn('cool down to avoid rate limit ::', rateLimit);
      await sleep(rateLimit.resetAfter * SECONDS);
    }
    return response.body;
  } catch (error: any) {
    if ([401, 403, 404].includes(error?.status)) {
      console.warn('status :: ', error?.status, { path, query });
      return [];
    }
    throw error;
  }
}

async function getDiscord({ path, query }: { path: string; query?: any }) {
  const url = 'https://discord.com/api';
  const response = await request
    .get(url + path)
    .query(query)
    .set('Authorization', 'Bot ' + DISCORD_TOKEN);
  return response;
}
