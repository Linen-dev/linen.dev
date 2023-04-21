import { sleep } from '@linen/utilities/promises';
import { SECONDS } from './constrains';
import axios from 'axios';
import { qs } from '@linen/utilities/url';
import {
  DiscordChannel,
  DiscordActiveThreads,
  DiscordArchivedPublicThreads,
  DiscordGuildMember,
} from '@linen/types';

async function discordApi({
  path,
  query = {},
  token,
}: {
  path: string;
  query?: any;
  token: string;
}) {
  let retriesLeft = 3;
  let lastFailure;
  do {
    try {
      const response = await axios.get(
        `https://discord.com/api${path}?${qs(query)}`,
        {
          headers: {
            Authorization: `Bot ${token}`,
          },
        }
      );
      const rateLimit = {
        remaining: Number(response.headers['x-ratelimit-remaining']),
        resetAfter: Number(response.headers['x-ratelimit-reset-after']),
      };
      if (rateLimit.remaining === 0) {
        console.warn('cool down to avoid rate limit ::', rateLimit);
        await sleep(rateLimit.resetAfter * SECONDS);
      }
      return response.data;
    } catch (error: any) {
      retriesLeft--;
      lastFailure = JSON.stringify(
        error?.response?.data || error?.request || error?.message
      );
      if ([404, 403, 401].includes(error?.status)) {
        throw lastFailure;
      }
      await sleep(15 * SECONDS);
    }
  } while (retriesLeft);
  throw lastFailure;
}

export default class DiscordApi {
  static async getArchivedPublicThreads({
    externalChannelId,
    before,
    token,
    limit,
  }: {
    externalChannelId: string;
    token: string;
    before?: string;
    limit: number;
  }) {
    return (await discordApi({
      path: `/channels/${externalChannelId}/threads/archived/public`,
      query: { limit, ...(before && { before }) },
      token,
    })) as DiscordArchivedPublicThreads;
  }

  static async getActiveThreads({
    token,
    serverId,
  }: {
    serverId: string;
    token: string;
  }) {
    return (await discordApi({
      path: `/guilds/${serverId}/threads/active`,
      token,
    })) as DiscordActiveThreads;
  }

  static async getDiscordChannels({
    serverId,
    token,
  }: {
    serverId: string;
    token: string;
  }) {
    return (await discordApi({
      path: `/guilds/${serverId}/channels`,
      token,
    })) as DiscordChannel[];
  }

  static async getDiscordUsers({
    serverId,
    token,
    limit,
    after,
  }: {
    serverId: string;
    after?: string;
    token: string;
    limit: number;
  }) {
    return (await discordApi({
      path: `/guilds/${serverId}/members`,
      query: { limit, after },
      token,
    })) as DiscordGuildMember[];
  }

  static async getMessages({
    externalId,
    token,
    limit,
    query,
  }: {
    externalId: string;
    token: string;
    limit: number;
    query: any;
  }) {
    return await discordApi({
      path: `/channels/${externalId}/messages`,
      query: { limit, ...query },
      token,
    });
  }
}
