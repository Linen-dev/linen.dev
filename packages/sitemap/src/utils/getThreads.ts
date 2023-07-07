import { prisma, Prisma } from '@linen/database';
import { UrlType, ChannelType } from './types';
import { batchSize, bodyLengthLimit } from '../config';

export async function getThreads(channels: Record<string, ChannelType>) {
  const sitemapPremium: Record<string, UrlType[]> = {};
  const sitemapFree: UrlType[] = [];

  let incrementId = 0;
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
      where: { incrementId: { gt: incrementId }, hidden: false },
      orderBy: { incrementId: 'asc' },
      take: batchSize,
    });

    const searchKeywords = await prisma.$queryRaw<
      { incrementId: number; searchKeywords: number }[]
    >`
    select t."incrementId",
    sum( length(m.textsearchable_index_col) ) as "searchKeywords"
    from threads t 
    left join messages m on t.id = m."threadId" 
    where t."incrementId" in (${Prisma.join(threads.map((t) => t.incrementId))})
    group by t."incrementId"
      `;

    threads.forEach((thread) => {
      if (
        channels[thread.channelId] && // skip, channel not in the list
        thread.messages.length && // skip, thread without messages
        !!thread.messages[0].author && // skip messages from unknown user (missing userId)
        !thread.messages[0].author.isBot // skip, messages from bot or missing user
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
            const keywords =
              searchKeywords.find((t) => t.incrementId === thread.incrementId)
                ?.searchKeywords || 0;

            if (
              // contentful: threads with characters >= 2000 + skip dup words
              (body.length >= 2000 && keywords > 25) ||
              // trend: threads with more than 100 visits
              thread.viewCount >= 100 ||
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

    if (threads.length === batchSize) {
      incrementId = threads[batchSize - 1].incrementId;
      // skip logging all
      if (Number(incrementId) % 10 === 0) {
        console.timeLog('query-threads');
        console.log('incrementId', incrementId);
      }
    } else {
      break;
    }
  } while (true);
  console.timeEnd('query-threads');
  return { sitemapPremium, sitemapFree };
}
