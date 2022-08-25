import type { accounts, channels, threads } from '@prisma/client';
import { v4 as random } from 'uuid';
import { prisma } from 'client';
import { channelGetServerSideProps, channelNextPage } from 'services/channel';
import {
  ChannelResponse,
  ChannelViewCursorProps,
} from 'components/Pages/Channels';
import { encodeCursor } from 'utilities/cursor';
import { SerializedThread } from 'serializers/thread';
jest.mock('utilities/dynamoCache');

const reqWithBotHeaders = {
  req: {
    headers: {
      'user-agent':
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    },
  },
};

const reqWithUserHeaders = {
  req: {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.0.0 Safari/537.36',
    },
  },
};

if (process.env.DATABASE_URL) throw 'be careful';

async function createThreads(
  channel: channels,
  account: accounts,
  threadsCount: number
) {
  const user = await prisma.users.create({
    data: {
      isAdmin: true,
      isBot: false,
      accountsId: account.id,
    },
  });

  const oneDay = 24 * 60 * 60 * 1000;
  const nDays = threadsCount * oneDay;
  const date = new Date().getTime() - nDays;

  const threads = [];
  for (let i = 0; i < threadsCount; i++) {
    const thread = await prisma.threads.create({
      data: {
        channelId: channel.id,
        slug: `slug-${channel.channelName}-${channel.id}-${i}`,
        messageCount: 2,
        externalThreadId: `thread-ts-${random()}`,
        sentAt: date + i * oneDay,
      },
    });
    await prisma.messages.create({
      data: {
        body: `foo-${i}-${random()}`,
        channelId: channel.id,
        threadId: thread.id,
        usersId: user.id,
        sentAt: new Date(date + i * oneDay).toISOString(),
        externalMessageId: `message-id-${random()}`,
      },
    });
    threads.push(thread);
  }
  return threads;
}

describe('channels services', () => {
  let account: accounts;
  let channel: channels;
  let threads: threads[];
  const threadsCount = 25;
  if (threadsCount < 25) throw 'we need at least 25 threads';
  const isSubdomain = true;
  let nextCursor: string;
  const threadIndex = Math.ceil(threadsCount / 2);

  beforeAll(async () => {
    account = await prisma.accounts.create({
      include: { channels: true },
      data: {
        premium: true,
        redirectDomain: `linen.${random()}.com`,
        slackDomain: `linen-${random()}`,
        discordDomain: `linen-${random()}`,
      },
    });
    channel = await prisma.channels.create({
      data: {
        channelName: `linen-${random()}`,
        externalChannelId: `linen-${random()}`,
        hidden: false,
        accountId: account.id,
      },
    });
    threads = await createThreads(channel, account, threadsCount);
  });

  describe('from channel view (users)', () => {
    let channelProps: ChannelResponse;

    describe('access the channel page', () => {
      beforeAll(async () => {
        channelProps = await channelGetServerSideProps(
          {
            params: {
              communityName: account.redirectDomain as string,
              channelName: channel.channelName,
            },
            ...reqWithUserHeaders,
          } as any,
          isSubdomain
        );
      });

      it('it should return the latest 10 threads', async () => {
        expect(channelProps.props?.threads).toBeInstanceOf(Array);
        const threadsProps = channelProps.props?.threads!.reverse()!;
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(
            threads[threads.length - 1 - idx].incrementId
          );
        }
      });
      it('it should have the next cursor as null', async () => {
        expect(channelProps.props?.nextCursor.next).toBe(null);
      });
      it('it should have the prev cursor set', async () => {
        expect(channelProps.props?.nextCursor.prev).not.toBeNull();
      });
    });

    describe('fetch more results', () => {
      let fetchMore: {
        threads: SerializedThread[];
        nextCursor: ChannelViewCursorProps;
      };
      beforeAll(async () => {
        fetchMore = await channelNextPage(
          channelProps.props?.currentChannel.id!,
          channelProps.props?.nextCursor.prev!
        );
      });

      it('it should return the previous 10 threads', async () => {
        expect(fetchMore.threads).toBeInstanceOf(Array);
        const threadsProps = fetchMore.threads.reverse();
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(
            threads[threads.length - 1 - 10 - idx].incrementId
          );
        }
      });
      it('it should have the next cursor set null', async () => {
        expect(channelProps.props?.nextCursor.next).toBeNull();
      });
      it('it should have the prev cursor set', async () => {
        expect(channelProps.props?.nextCursor.prev).not.toBeNull();
      });
    });
  });

  describe('from channel view (bots)', () => {
    describe('access the channel page with pathCursor as asc:0', () => {
      let channelProps: ChannelResponse;
      beforeAll(async () => {
        channelProps = await channelGetServerSideProps(
          {
            params: {
              communityName: account.redirectDomain as string,
              channelName: channel.channelName,
              page: encodeCursor('asc:gt:0'),
            },
            ...reqWithBotHeaders,
          } as any,
          isSubdomain
        );
      });
      it('it should return the first 10 threads', async () => {
        expect(channelProps.props?.threads).toBeInstanceOf(Array);
        const threadsProps = channelProps.props?.threads!;
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(threads[idx].incrementId);
        }
      });
      it('it should have the next cursor set', async () => {
        expect(channelProps.props?.nextCursor.next).not.toBeNull();
        nextCursor = channelProps.props?.nextCursor.next as string;
      });
      it('it should have the prev cursor as null', async () => {
        expect(channelProps.props?.nextCursor.prev).toBeNull();
      });
    });

    describe('access the channel page with pathCursor from next page', () => {
      let channelProps: ChannelResponse;
      beforeAll(async () => {
        channelProps = await channelGetServerSideProps(
          {
            params: {
              communityName: account.redirectDomain as string,
              channelName: channel.channelName,
              page: nextCursor,
            },
            ...reqWithBotHeaders,
          } as any,
          isSubdomain
        );
      });
      it('it should return the next 10 threads', async () => {
        expect(channelProps.props?.threads).toBeInstanceOf(Array);
        const threadsProps = channelProps.props?.threads!;
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(
            threads[idx + 10].incrementId
          );
        }
      });
      it('it should have the next cursor set', async () => {
        expect(channelProps.props?.nextCursor.next).not.toBeNull();
      });
      it('it should have the prev cursor set', async () => {
        expect(channelProps.props?.nextCursor.prev).not.toBeNull();
      });
    });

    describe('access the channel page with pathCursor from thread view', () => {
      let channelProps: ChannelResponse;
      beforeAll(async () => {
        channelProps = await channelGetServerSideProps(
          {
            params: {
              communityName: account.redirectDomain as string,
              channelName: channel.channelName,
              page: encodeCursor(`asc:gte:${threads[threadIndex].sentAt}`),
            },
            ...reqWithBotHeaders,
          } as any,
          isSubdomain
        );
      });
      it('it should return the thread + next 9 threads', async () => {
        expect(channelProps.props?.threads).toBeInstanceOf(Array);
        const threadsProps = channelProps.props?.threads!;
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(
            threads[idx + threadIndex].incrementId
          );
        }
      });
      it('it should have the next cursor set', async () => {
        expect(channelProps.props?.nextCursor.next).not.toBeNull();
      });
      it('next cursor should return the next 10 threads', async () => {
        const fetchMore = await channelNextPage(
          channelProps.props?.currentChannel.id!,
          channelProps.props?.nextCursor.next!
        );
        for (let idx = 0; idx < fetchMore.threads.length; idx++) {
          expect(fetchMore.threads[idx].incrementId).toBe(
            threads[idx + threadIndex + 10].incrementId
          );
        }
      });
      it('it should have the prev cursor set', async () => {
        expect(channelProps.props?.nextCursor.prev).not.toBeNull();
      });
      it('prev cursor should return the prev 10 threads', async () => {
        const fetchMore = await channelNextPage(
          channelProps.props?.currentChannel.id!,
          channelProps.props?.nextCursor.prev!
        );
        for (let idx = 0; idx < fetchMore.threads.length; idx++) {
          expect(fetchMore.threads[idx].incrementId).toBe(
            threads[threadIndex - 10 + idx].incrementId
          );
        }
      });
    });

    describe('access the channel page with pathCursor from last 3 threads', () => {
      let channelProps: ChannelResponse;
      beforeAll(async () => {
        channelProps = await channelGetServerSideProps(
          {
            params: {
              communityName: account.redirectDomain as string,
              channelName: channel.channelName,
              page: encodeCursor(`asc:gte:${threads[threadsCount - 3].sentAt}`),
            },
            ...reqWithBotHeaders,
          } as any,
          isSubdomain
        );
      });
      it('it should return the thread + next 2 threads', async () => {
        expect(channelProps.props?.threads).toBeInstanceOf(Array);
        const threadsProps = channelProps.props?.threads!;
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(
            threads[idx + threadsCount - 3].incrementId
          );
        }
      });
      it('it should have the next cursor set', async () => {
        expect(channelProps.props?.nextCursor.next).toBeNull();
      });
      it('it should have the prev cursor set', async () => {
        expect(channelProps.props?.nextCursor.prev).not.toBeNull();
      });
    });
  });
});
