import type { accounts, channels, threads } from '@prisma/client';
import { v4 as random } from 'uuid';
import { prisma } from '../../client';
import { threadGetServerSideProps } from 'services/threads';
import { encodeCursor } from 'utilities/cursor';
import { createThreadsOneByDay } from 'bin/factory/threads';
jest.mock('utilities/dynamoCache');

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

    it('it should have a link to go back to the channel', async () => {
      const threadProps = await threadGetServerSideProps(
        {
          params: {
            threadId: String(scope.threads[scope.threadIndex].incrementId),
            communityName: scope.account.redirectDomain as string,
          },
        },
        scope.isSubdomain
      );
      expect(threadProps.props?.pathCursor).not.toBeNull();
      expect(threadProps.props?.pathCursor).toBe(
        encodeCursor(`asc:gte:${scope.threads[scope.threadIndex].sentAt}`)
      );
    });
  });
});
