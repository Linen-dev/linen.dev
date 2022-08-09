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
        account: {
          OR: [
            {
              discordDomain: host,
            },
            {
              discordServerId: host,
            },
            {
              slackDomain: host,
            },
            {
              redirectDomain: host,
            },
          ],
        },
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
    expect(result).toHaveLength(5);

    expect(result[0]).toBe(`c/${channelMock.channelName}/YXNjOmd0OjA=`);
    expect(result[1]).toBe(`t/${threadMock.incrementId}/${threadMock.slug}`);
    expect(result[2]).toBe(`t/${thread2Mock.incrementId}/${thread2Mock.slug}`);
    expect(result[3]).toBe(`c/${channelMock.channelName}/YXNjOmd0OjEyNA==`);
    expect(result[4]).toBe(`t/${thread3Mock.incrementId}/${thread3Mock.slug}`);
  });
});
