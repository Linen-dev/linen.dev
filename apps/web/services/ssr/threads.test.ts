import { accounts, channels, threads, prisma } from '@linen/database';
import { v4 as random } from 'uuid';
import { threadGetServerSideProps } from 'services/ssr/threads';
import { createThreadsOneByDay } from 'bin/factory/threads';
jest.mock('services/session');

describe('threads services', () => {
  describe('from thread view', () => {
    const scope = {
      account: {} as accounts,
      channel: {} as channels,
      threads: [] as threads[],
      threadsCount: 1,
      isSubdomain: true,
      nextCursor: '',
      threadIndex: 0,
    };

    if (scope.threadsCount < 1) throw 'we need at least 1 thread';

    beforeAll(async () => {
      scope.account = await prisma.accounts.create({
        include: { channels: true },
        data: {
          premium: true,
          redirectDomain: `linen.${random()}.com`,
          slackDomain: `linen-${random()}`,
          discordDomain: `linen-${random()}`,
          name: random(),
        },
      });
      scope.channel = await prisma.channels.create({
        data: {
          channelName: `linen-${random()}`,
          externalChannelId: `linen-${random()}`,
          hidden: false,
          accountId: scope.account.id,
        },
      });
      scope.threads = await createThreadsOneByDay(
        scope.channel,
        scope.account,
        scope.threadsCount
      );
    });

    it.skip('it should have a link to go back to the channel', async () => {
      const threadProps = await threadGetServerSideProps(
        {
          params: {
            threadId: String(scope.threads[scope.threadIndex].incrementId),
            communityName: scope.account.redirectDomain as string,
          },
        },
        scope.isSubdomain
      );
      expect(threadProps.props).toMatchObject({
        channels: [
          {
            accountId: scope.account.id,
            channelName: scope.channel.channelName,
            default: false,
            displayOrder: 0,
            hidden: false,
            id: scope.channel.id,
            landing: false,
            pages: null,
            type: 'PUBLIC',
            viewType: 'CHAT',
          },
        ],
        communities: [],
        currentChannel: {
          accountId: scope.account.id,
          channelName: scope.channel.channelName,
          default: false,
          displayOrder: 0,
          hidden: false,
          id: scope.channel.id,
          landing: false,
          pages: null,
          type: 'PUBLIC',
          viewType: 'CHAT',
        },
        currentCommunity: {
          anonymize: 'NONE',
          anonymizeUsers: false,
          brandColor: null,
          chat: 'MEMBERS',
          communityType: null,
          communityUrl: null,
          description: null,
          discordDomain: scope.account.discordDomain,
          discordServerId: null,
          docsUrl: null,
          faviconUrl: null,
          googleAnalyticsId: null,
          hasAuth: false,
          homeUrl: null,
          id: scope.account.id,
          logoSquareUrl: null,
          logoUrl: null,
          name: scope.account.name,
          newChannelsConfig: 'NOT_HIDDEN',
          premium: true,
          redirectDomain: scope.account.redirectDomain,
          redirectDomainPropagate: null,
          search: null,
          slackDomain: scope.account.slackDomain,
          syncStatus: 'NOT_STARTED',
          type: 'PUBLIC',
        },
        dms: [],
        isBot: false,
        isSubDomainRouting: true,
        permissions: {
          access: true,
          accountId: scope.account.id,
          auth: null,
          channel_create: false,
          chat: false,
          inbox: false,
          is_member: false,
          manage: false,
          starred: false,
          token: null,
          user: null,
        },
        publicChannels: [
          {
            accountId: scope.account.id,
            channelName: scope.channel.channelName,
            default: false,
            displayOrder: 0,
            hidden: false,
            id: scope.channel.id,
            landing: false,
            pages: null,
            type: 'PUBLIC',
            viewType: 'CHAT',
          },
        ],
        settings: {
          brandColor: 'var(--color-navbar)',
          chat: 'MEMBERS',
          communityId: scope.account.id,
          communityName: scope.account.slackDomain,
          communityType: 'linen',
          communityUrl: '',
          docsUrl: 'https://linen.dev',
          homeUrl: 'https://linen.dev',
          logoUrl:
            'https://static.main.linendev.com/logos/linen-white-logo.svg',
          name: scope.account.name,
          prefix: 's',
          redirectDomain: scope.account.redirectDomain,
        },
        thread: {
          answer: null,
          channel: {
            accountId: scope.account.id,
            channelName: scope.channel.channelName,
            default: false,
            displayOrder: 0,
            hidden: false,
            id: scope.channel.id,
            landing: false,
            pages: null,
            type: 'PUBLIC',
            viewType: 'CHAT',
          },
          channelId: scope.channel.id,
          externalThreadId: scope.threads[0].externalThreadId,
          feed: false,
          hidden: false,
          id: scope.threads[0].id,
          incrementId: scope.threads[0].incrementId,
          lastReplyAt: expect.any(String),
          messageCount: 2,
          messages: [
            {
              attachments: [],
              author: {
                anonymousAlias: null,
                authsId: null,
                displayName: null,
                externalUserId: null,
                id: expect.any(String),
                profileImageUrl: null,
                role: 'MEMBER',
                search: null,
                username: null,
              },
              body: expect.any(String),
              externalId: null,
              id: expect.any(String),
              mentions: [],
              messageFormat: 'LINEN',
              reactions: [],
              sentAt: expect.any(String),
              threadId: scope.threads[0].id,
              usersId: expect.any(String),
            },
            {
              attachments: [],
              author: {
                anonymousAlias: null,
                authsId: null,
                displayName: null,
                externalUserId: null,
                id: expect.any(String),
                profileImageUrl: null,
                role: 'MEMBER',
                search: null,
                username: null,
              },
              body: expect.any(String),
              externalId: null,
              id: expect.any(String),
              mentions: [],
              messageFormat: 'LINEN',
              reactions: [],
              sentAt: expect.any(String),
              threadId: scope.threads[0].id,
              usersId: expect.any(String),
            },
          ],
          page: null,
          pinned: false,
          question: null,
          resolutionId: null,
          robotsMetaTag: null,
          sentAt: expect.any(String),
          slug: expect.any(String),
          state: 'OPEN',
          title: null,
          viewCount: 0,
        },
        token: null,
      });
    });
  });
});
