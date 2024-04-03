/**
 * @jest-environment node
 */

jest.mock('services/session');
import { accounts, channels, threads } from '@linen/database';
import { v4 as random } from 'uuid';
import { channelGetServerSideProps } from 'services/ssr/channels';
import { SerializedThread } from '@linen/types';
import { createThreadsOneByDay } from 'bin/factory/threads';
import { channelNextPage } from 'services/channels/channelNextPage';
import { createAccount, createChannel } from '@linen/factory';

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

describe('channels services', () => {
  jest.setTimeout(10 * 1000);
  let scope: any;

  beforeAll(async () => {
    scope = {
      account: {} as accounts,
      channel: {} as channels,
      threads: [] as threads[],
      threadsCount: 70,
      isSubdomain: true,
      nextCursor: '',
      pageSize: 30,
    };
    scope.account = await createAccount({
      premium: true,
      redirectDomain: `linen.${random()}.com`,
      slackDomain: `linen-${random()}`,
      discordDomain: `linen-${random()}`,
    });
    scope.channel = await createChannel({
      channelName: `linen-${random()}`,
      externalChannelId: `linen-${random()}`,
      hidden: false,
      accountId: scope.account.id,
    });
    scope.threads = await createThreadsOneByDay(
      scope.channel,
      scope.account,
      scope.threadsCount
    );
  });

  describe('from channel view (users)', () => {
    let channelProps: any;

    describe('access the channel page', () => {
      beforeAll(async () => {
        channelProps = await channelGetServerSideProps(
          {
            params: {
              communityName: scope.account.redirectDomain as string,
              channelName: scope.channel.channelName,
            },
            ...reqWithUserHeaders,
          } as any,
          scope.isSubdomain
        );
      });

      it('it should return the latest 30 threads', async () => {
        expect(channelProps.props?.threads).toBeInstanceOf(Array);
        const threadsProps = channelProps.props?.threads!.reverse()!;
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(
            scope.threads[scope.threads.length - 1 - idx].incrementId
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
        nextCursor: {
          next: string | null;
          prev: string | null;
        };
      };
      beforeAll(async () => {
        fetchMore = await channelNextPage({
          channelId: channelProps.props?.currentChannel.id!,
          cursor: channelProps.props?.nextCursor.prev!,
        });
      });

      it('it should return the previous 30 threads', async () => {
        expect(fetchMore.threads).toBeInstanceOf(Array);
        const threadsProps = fetchMore.threads.reverse();
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(
            scope.threads[scope.threads.length - 1 - scope.pageSize - idx]
              .incrementId
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
    describe('access the channel page 1', () => {
      let channelProps: any;
      beforeAll(async () => {
        channelProps = await channelGetServerSideProps(
          {
            params: {
              communityName: scope.account.redirectDomain as string,
              channelName: scope.channel.channelName,
              page: 1,
            },
            ...reqWithBotHeaders,
          } as any,
          scope.isSubdomain
        );
      });
      it('it should return the first 30 threads', async () => {
        expect(channelProps.props?.threads).toBeInstanceOf(Array);
        const threadsProps = channelProps.props?.threads!;
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(
            scope.threads[idx].incrementId
          );
        }
      });
    });

    describe('access the channel page 2', () => {
      let channelProps: any;
      beforeAll(async () => {
        channelProps = await channelGetServerSideProps(
          {
            params: {
              communityName: scope.account.redirectDomain as string,
              channelName: scope.channel.channelName,
              page: 2,
            },
            ...reqWithBotHeaders,
          } as any,
          scope.isSubdomain
        );
      });
      it('it should return the next 30 threads', async () => {
        expect(channelProps.props?.threads).toBeInstanceOf(Array);
        const threadsProps = channelProps.props?.threads!;
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(
            scope.threads[idx + 30].incrementId
          );
        }
      });
    });

    describe('access the channel page latest', () => {
      let channelProps: any;
      beforeAll(async () => {
        channelProps = await channelGetServerSideProps(
          {
            params: {
              communityName: scope.account.redirectDomain as string,
              channelName: scope.channel.channelName,
            },
            ...reqWithBotHeaders,
          } as any,
          scope.isSubdomain
        );
      });
      it('it should return the last 30 threads', async () => {
        expect(channelProps.props?.threads).toBeInstanceOf(Array);
        const threadsProps = channelProps.props?.threads!.reverse()!;
        for (let idx = 0; idx < threadsProps.length; idx++) {
          expect(threadsProps[idx].incrementId).toBe(
            scope.threads[scope.threads.length - 1 - idx].incrementId
          );
        }
      });
    });
  });
});
