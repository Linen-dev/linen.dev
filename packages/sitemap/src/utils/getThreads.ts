import { prisma } from '@linen/database';
import { UrlType, ChannelType } from './types';
import { batchSize, bodyLengthLimit } from '../config';

export async function getThreads(channels: Record<string, ChannelType>) {
  const sitemapPremium: Record<string, UrlType[]> = {};
  const sitemapFree: UrlType[] = [];

  let sentAt = BigInt(0);
  console.time('query-threads');
  do {
    const threads = await prisma.threads.findMany({
      select: {
        messages: {
          select: {
            sentAt: true,
            body: true,
            author: { select: { isBot: true } },
            reactions: { select: { count: true } },
          },
          orderBy: { sentAt: 'asc' },
        },
        incrementId: true,
        slug: true,
        channelId: true,
        sentAt: true,
        viewCount: true,
        messageCount: true,
        firstManagerReplyAt: true,
      },
      where: { sentAt: { gt: sentAt }, hidden: false },
      orderBy: { sentAt: 'asc' },
      take: batchSize,
    });

    threads.forEach((thread) => {
      if (
        channels[thread.channelId] && // skip, channel not in the list
        thread.messages.length && // skip, thread without messages
        !thread.messages[0].author?.isBot // skip, messages from bot or missing user
      ) {
        const body = thread.messages
          .map((m) => m.body)
          .join(' ')
          .replace(/\s+/g, ' '); // clean up dup space
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
          };

          const reactions = thread.messages.reduce(
            (prev, curr) =>
              prev + curr.reactions.reduce((p, c) => p + (c.count || 0), 0),
            0
          );

          if (account.customDomain) {
            // premium
            if (!sitemapPremium[account.id]) {
              sitemapPremium[account.id] = [];
            }
            sitemapPremium[account.id].push(t);
          } else {
            if (
              // trend: threads with more than 100 visits
              thread.viewCount >= 100 ||
              // contentful: threads with characters >= 2000
              body.length >= 2000 ||
              // popular: threads with reactions>10 replies>2 characters>500
              (reactions > 10 &&
                thread.messages.length >= 3 &&
                body.length >= 500) ||
              // reliable: threads where managers replied + replies >= 3
              (!!thread.firstManagerReplyAt && thread.messages.length >= 3) ||
              // collective: threads with replies >= 10
              thread.messages.length >= 10
            ) {
              sitemapFree.push({
                ...t,
                url: account.pathDomain + t.url,
              });
            }
          }
        }
      }
    });

    console.timeLog('query-threads');
    if (threads.length === batchSize) {
      sentAt = threads[batchSize - 1].sentAt;
      console.log('sentAt', sentAt);
    } else {
      break;
    }
  } while (true);
  console.timeEnd('query-threads');
  return { sitemapPremium, sitemapFree };
}
