import { retryPromise, sleep } from 'utilities/retryPromises';
import request from 'superagent';
import { SECONDS } from './constrains';

export async function getDiscordWithRetry({
  path,
  query = {},
  token,
}: {
  path: string;
  query?: any;
  token: string;
}): Promise<any> {
  try {
    const response = await retryPromise({
      promise: getDiscord({ path, query, token }),
    });
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
    console.warn('status :: ', error?.status, JSON.stringify({ path, query }));
    return [];
  }
}

async function getDiscord({
  path,
  query,
  token,
}: {
  path: string;
  query?: any;
  token: string;
}) {
  const url = 'https://discord.com/api';
  const response = await request
    .get(url + path)
    .query(query)
    .set('Authorization', `Bot ${token}`);
  return response;
}
