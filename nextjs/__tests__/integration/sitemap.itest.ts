import type { accounts, channels } from '@prisma/client';
import prisma from '../../client';
import { v4 } from 'uuid';
import * as sitemap from '../../utilities/sitemap';

const random = () => v4();

if (process.env.DATABASE_URL) throw 'be careful';

async function createChannel({
  account,
  hidden,
  createThreads = true,
}: {
  account: accounts;
  hidden: boolean;
  createThreads: boolean;
}) {
  const channel = await prisma.channels.create({
    data: {
      channelName: `channel-${random()}`,
      externalChannelId: `channel-${random()}`,
      accountId: account.id,
      hidden,
    },
  });
  const user = await prisma.users.create({
    data: {
      isAdmin: true,
      isBot: false,
      accountsId: account.id,
    },
  });
  if (createThreads) {
    for (let i = 0; i < 10; i++) {
      const thread = await prisma.threads.create({
        data: {
          channelId: channel.id,
          slug: `slug-${channel.channelName}-${channel.id}-${i}`,
          messageCount: 2,
          externalThreadId: `thread-ts-${random()}`,
          sentAt: new Date().getTime(),
        },
      });
      await prisma.messages.create({
        data: {
          body: `foo-${i}`,
          channelId: channel.id,
          threadId: thread.id,
          usersId: user.id,
          sentAt: new Date().toISOString(),
          externalMessageId: `message-id-${random()}`,
        },
      });
    }
  }
  return channel;
}

describe('sitemap', () => {
  let premium: accounts;
  let premiumChannels: {
    hiddenWithThreads: channels;
    empty: channels;
    withThreads: channels;
  };

  let free1: accounts;
  let free1Channels: {
    hiddenWithThreads: channels;
    empty: channels;
    withThreads: channels;
  };

  let free2: accounts;
  let free2Channels: {
    hiddenWithThreads: channels;
    empty: channels;
    withThreads: channels;
  };

  let freeEmpty: accounts;

  beforeAll(async () => {
    premium = await prisma.accounts.create({
      data: {
        premium: true,
        redirectDomain: `linen.${random()}.com`,
        slackDomain: `linen-${random()}`,
        discordDomain: `linen-${random()}`,
      },
    });
    premiumChannels = {
      withThreads: await createChannel({
        account: premium,
        hidden: false,
        createThreads: true,
      }),
      hiddenWithThreads: await createChannel({
        account: premium,
        hidden: true,
        createThreads: true,
      }),
      empty: await createChannel({
        account: premium,
        hidden: false,
        createThreads: false,
      }),
    };

    free1 = await prisma.accounts.create({
      data: {
        premium: false,
        slackDomain: 'cool',
      },
    });
    free1Channels = {
      withThreads: await createChannel({
        account: free1,
        hidden: false,
        createThreads: true,
      }),
      hiddenWithThreads: await createChannel({
        account: free1,
        hidden: true,
        createThreads: true,
      }),
      empty: await createChannel({
        account: free1,
        hidden: false,
        createThreads: false,
      }),
    };

    free2 = await prisma.accounts.create({
      data: {
        premium: false,
        slackDomain: 'awesome',
      },
    });
    free2Channels = {
      withThreads: await createChannel({
        account: free2,
        hidden: false,
        createThreads: true,
      }),
      hiddenWithThreads: await createChannel({
        account: free2,
        hidden: true,
        createThreads: true,
      }),
      empty: await createChannel({
        account: free2,
        hidden: false,
        createThreads: false,
      }),
    };

    freeEmpty = await prisma.accounts.create({
      data: {
        premium: false,
        discordDomain: 'nice',
      },
    });
  });

  describe('premium community with 1 hidden channel and 1 channel without threads', () => {
    const sitemapBuilder = jest.fn((e) => e.join());
    let result: string;

    beforeAll(async () => {
      result = await sitemap.createSitemapForPremium(
        premium.redirectDomain as string,
        sitemapBuilder
      );
    });

    it("it shouldn't show the hidden channel", async () => {
      expect(result).not.toMatch(
        new RegExp(premiumChannels.hiddenWithThreads.channelName)
      );
    });
    it("it shouldn't show the channel without threads", async () => {
      expect(result).not.toMatch(new RegExp(premiumChannels.empty.channelName));
    });
    it('it should call the sitemap builder once', async () => {
      expect(sitemapBuilder).toHaveBeenCalledTimes(1);
    });
    it('it should show the channel with threads', async () => {
      expect(result).toMatch(
        new RegExp(premiumChannels.withThreads.channelName)
      );
    });
    it("it shouldn't be empty", async () => {
      expect(result).not.toBeUndefined();
      expect(result).not.toBeFalsy();
      expect(result).not.toBe('');
    });
  });

  describe('free community with 1 hidden channel and 1 channel without threads', () => {
    const sitemapBuilder = jest.fn((e) => e.join());
    let result: string;

    beforeAll(async () => {
      result = await sitemap.createSitemapForFree(
        'localhost',
        free1.slackDomain as string,
        's',
        sitemapBuilder
      );
    });

    it("it shouldn't show the hidden channel", async () => {
      expect(result).not.toMatch(
        new RegExp(free1Channels.hiddenWithThreads.channelName)
      );
    });
    it("it shouldn't show the channel without threads", async () => {
      expect(result).not.toMatch(new RegExp(free1Channels.empty.channelName));
    });
    it('it should call the sitemap builder once', async () => {
      expect(sitemapBuilder).toHaveBeenCalledTimes(1);
    });
    it('it should show the channel with threads', async () => {
      expect(result).toMatch(new RegExp(free1Channels.withThreads.channelName));
    });
    it("it shouldn't be empty", async () => {
      expect(result).not.toBeUndefined();
      expect(result).not.toBeFalsy();
      expect(result).not.toBe('');
    });
  });

  describe(`main sitemap with 3 free communities, one without threads, two with one hidden channel and one channel without threads`, () => {
    const sitemapBuilder = jest.fn((e) => e.join());
    let result: string;

    beforeAll(async () => {
      result = await sitemap.createSitemapForLinen('localhost', sitemapBuilder);
    });

    it('it should call the sitemap builder once', async () => {
      expect(sitemapBuilder).toHaveBeenCalledTimes(1);
    });
    it("it shouldn't show any premium community", async () => {
      premium.discordDomain &&
        expect(result).not.toMatch(new RegExp(premium.discordDomain));
      premium.slackDomain &&
        expect(result).not.toMatch(new RegExp(premium.slackDomain));
      premium.redirectDomain &&
        expect(result).not.toMatch(new RegExp(premium.redirectDomain));
    });
    it("it shouldn't show the community without threads", async () => {
      freeEmpty.discordDomain &&
        expect(result).not.toMatch(new RegExp(freeEmpty.discordDomain));
      freeEmpty.slackDomain &&
        expect(result).not.toMatch(new RegExp(freeEmpty.slackDomain));
      freeEmpty.redirectDomain &&
        expect(result).not.toMatch(new RegExp(freeEmpty.redirectDomain));
    });
    it('it should show the communities with threads', async () => {
      free1.discordDomain &&
        expect(result).toMatch(new RegExp(free1.discordDomain));
      free1.slackDomain &&
        expect(result).toMatch(new RegExp(free1.slackDomain));
      free1.redirectDomain &&
        expect(result).toMatch(new RegExp(free1.redirectDomain));
      free2.discordDomain &&
        expect(result).toMatch(new RegExp(free2.discordDomain));
      free2.slackDomain &&
        expect(result).toMatch(new RegExp(free2.slackDomain));
      free2.redirectDomain &&
        expect(result).toMatch(new RegExp(free2.redirectDomain));
    });
    it("it shouldn't be empty", async () => {
      expect(result).not.toBeUndefined();
      expect(result).not.toBeFalsy();
      expect(result).not.toBe('');
    });
  });
});
