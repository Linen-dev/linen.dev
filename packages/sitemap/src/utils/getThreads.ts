import { prisma } from '@linen/database';
import { UrlType, ChannelType } from './types';
import {
  batchSize,
  bodyLengthHighPriority,
  bodyLengthLimit,
  lastIncrementId,
} from '../config';

export async function getThreads(channels: Record<string, ChannelType>) {
  const sitemapPremium: Record<string, UrlType[]> = {};
  const sitemapFree: UrlType[] = [];

  let incrementId = lastIncrementId.valueOf();
  console.time('query-threads');
  do {
    const threads = await prisma.threads.findMany({
      select: {
        messages: {
          select: {
            sentAt: true,
            body: true,
            author: { select: { isBot: true } },
          },
          orderBy: { sentAt: 'asc' },
        },
        incrementId: true,
        slug: true,
        channelId: true,
        sentAt: true,
        viewCount: true,
        messageCount: true,
      },
      where: { incrementId: { lt: incrementId }, hidden: false },
      orderBy: { incrementId: 'desc' },
      take: batchSize,
    });

    threads.forEach((thread) => {
      if (
        channels[thread.channelId] && // skip, channel not in the list
        thread.messages.length && // skip, thread without messages
        !thread.messages[0].author?.isBot // skip, messages from bot or missing user
      ) {
        const body = thread.messages.map((m) => m.body).join('');
        if (
          body.length > bodyLengthLimit // skip, threads with less than 50 characters
        ) {
          const account = channels[thread.channelId].account;
          const t = {
            url: encodeURI(
              `/t/${thread.incrementId}/${(
                thread.slug || 'topic'
              ).toLowerCase()}`
            ),
            lastmodISO: new Date(
              thread.messages.pop()?.sentAt || Number(thread.sentAt)
            ).toISOString(),
            priority:
              body.length >= bodyLengthHighPriority
                ? 1.0
                : thread.messageCount > 5 && thread.viewCount > 0
                ? 0.9
                : thread.messageCount > 1
                ? 0.8
                : 0.7,
          };
          if (account.customDomain) {
            // premium
            if (!sitemapPremium[account.id]) {
              sitemapPremium[account.id] = [];
            }
            sitemapPremium[account.id].push(t);
          } else {
            // pathDomain
            sitemapFree.push({ ...t, url: account.pathDomain + t.url });
          }
        }
      }
    });

    console.timeLog('query-threads');
    if (threads.length === batchSize) {
      incrementId = threads[batchSize - 1].incrementId;
      console.log('incrementId', incrementId);
    } else {
      break;
    }
  } while (true);
  console.timeEnd('query-threads');
  return { sitemapPremium, sitemapFree };
}
