import { prismaMock } from '__tests__/singleton';
import { createXMLSitemapForChannel } from './sitemap';

describe('sitemaps', () => {
  it('should list all threads from the channel plus all cursor pages', async () => {
    const host = 'customer.custom.domain';
    const channelName = 'general';

    const channelMock = {
      accountId: 'accountId',
      channelName,
      default: true,
      externalChannelId: 'externalChannelId',
      externalPageCursor: 'externalPageCursor',
      hidden: true,
      id: 'id',
    };
    const threadMock = {
      incrementId: 1,
      messageCount: 2,
      sentAt: 123,
      slug: 'slug1',
    };
    const thread2Mock = {
      incrementId: 2,
      messageCount: 2,
      sentAt: 124,
      slug: 'slug2',
    };
    const thread3Mock = {
      incrementId: 3,
      messageCount: 2,
      sentAt: 125,
      slug: 'slug3',
    };

    const channelsFindFirstMock =
      prismaMock.channels.findFirst.mockResolvedValue(channelMock);
    const threadsFindManyMock = prismaMock.threads.findMany
      .mockResolvedValueOnce([threadMock, thread2Mock])
      .mockResolvedValueOnce([thread3Mock])
      .mockResolvedValue([]);

    const result = await createXMLSitemapForChannel(host, channelName);

    expect(channelsFindFirstMock).toHaveBeenCalledTimes(1);
    expect(channelsFindFirstMock).toHaveBeenNthCalledWith(1, {
      where: {
        channelName,
        account: { redirectDomain: host },
        hidden: false,
      },
    });

    expect(threadsFindManyMock).toHaveBeenCalledTimes(3);
    expect(threadsFindManyMock).toHaveBeenNthCalledWith(1, {
      where: { channelId: channelMock.id, sentAt: { gt: BigInt(0) } },
      orderBy: { sentAt: 'asc' },
      select: {
        incrementId: true,
        slug: true,
        messageCount: true,
        sentAt: true,
      },
      take: 10,
    });
    expect(threadsFindManyMock).toHaveBeenNthCalledWith(2, {
      where: { channelId: channelMock.id, sentAt: { gt: thread2Mock.sentAt } },
      orderBy: { sentAt: 'asc' },
      select: {
        incrementId: true,
        slug: true,
        messageCount: true,
        sentAt: true,
      },
      take: 10,
    });
    expect(threadsFindManyMock).toHaveBeenNthCalledWith(3, {
      where: { channelId: channelMock.id, sentAt: { gt: thread3Mock.sentAt } },
      orderBy: { sentAt: 'asc' },
      select: {
        incrementId: true,
        slug: true,
        messageCount: true,
        sentAt: true,
      },
      take: 10,
    });

    expect(result).toBeDefined();
    console.log('result', result);

    expect(
      /https:\/\/customer.custom.domain\/c\/general\/YXNjOmd0OjA=/.exec(result)
    ).toHaveLength(1);
    expect(
      /https:\/\/customer.custom.domain\/c\/general\/YXNjOmd0OjEyNA==/.exec(
        result
      )
    ).toHaveLength(1);
    expect(
      /https:\/\/customer.custom.domain\/t\/1\/slug1/.exec(result)
    ).toHaveLength(1);
    expect(
      /https:\/\/customer.custom.domain\/t\/2\/slug2/.exec(result)
    ).toHaveLength(1);
    expect(
      /https:\/\/customer.custom.domain\/t\/3\/slug3/.exec(result)
    ).toHaveLength(1);
  });
});
