import { accounts, channels } from '@prisma/client';
import { v4 } from 'uuid';
import {
  createSitemapForPremium,
  createSitemapForLinen,
  createSitemapForFree,
  createSitemapForFreeByChannel,
} from '../../utilities/sitemap';
import setup from '__tests__/spec-helpers/integration';
import { create } from '__tests__/factory';

setup({ truncationStrategy: 'none' });

const random = () => v4();

async function createChannel({
  account,
  hidden,
  createThreads = true,
}: {
  account: accounts;
  hidden: boolean;
  createThreads: boolean;
}) {
  const channel = await create('channel', {
    channelName: `channel-${random()}`,
    accountId: account.id,
    hidden,
  });
  const user = await create('user', {
    isAdmin: true,
    isBot: false,
    accountsId: account.id,
  });
  if (createThreads) {
    for (let i = 0; i < 10; i++) {
      const thread = await create('thread', {
        channelId: channel.id,
        slug: `slug-${channel.channelName}-${channel.id}-${i}`,
        messageCount: 2,
      });
      await create('message', {
        body: `foo-${i}`,
        channelId: channel.id,
        threadId: thread.id,
        usersId: user.id,
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
    premium = await create('account', {});
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

    free1 = await create('account', {
      premium: false,
      slackDomain: 'cool',
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

    free2 = await create('account', {
      premium: false,
      slackDomain: 'slack-domain',
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

    freeEmpty = await create('account', {
      premium: false,
      discordDomain: 'discord-domain',
    });
  });

  describe('premium community with 1 hidden channel and 1 channel without threads', () => {
    let sitemapBuilder: any;
    let result: string;

    beforeAll(async () => {
      sitemapBuilder = jest.fn((e) => e.join());
      result = await createSitemapForPremium(
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
    let sitemapBuilder: any;
    let result: string;

    beforeAll(async () => {
      sitemapBuilder = jest.fn((e) => e.join());
      result = await createSitemapForFree(
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
      result = await createSitemapForLinen('localhost', sitemapBuilder);
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

describe.only('createSitemapForFreeByChannel', () => {
  it('returns a sitemap', async () => {
    const builder = jest.fn();
    const community = await create('account', {
      name: 'linen.com',
      redirectDomain: 'linen.com',
    });
    const channel = await create('channel', {
      accountId: community.id,
    });
    await create('thread', { channelId: channel.id });
    await createSitemapForFreeByChannel(
      community.redirectDomain,
      channel.channelName,
      community.name,
      's',
      builder
    );
    expect(builder).toHaveBeenCalledWith('https://linen.com/s/linen.com/', [
      'c/general/YXNjOmd0OjA=',
    ]);
  });
});
