jest.mock('services/slack/api');

import { syncChannels } from './syncChannels';
import * as fetch_all_conversations from 'services/slack/api';
import { create } from '@linen/factory';
import { prisma } from '@linen/database';
import { v4 } from 'uuid';

const CHANNELS_COUNT = 5;

const externalChannels = Array.from(Array(CHANNELS_COUNT).keys()).map(() => {
  return { name: v4(), id: v4() };
});

describe('slackSync :: syncChannels', () => {
  let accountId: any;

  beforeAll(async () => {
    const newAccount = await create('account', {
      slackTeamId: v4(),
      slackAuthorizations: {
        create: {
          accessToken: v4(),
          botUserId: v4(),
          scope: v4(),
        },
      },
      channels: {
        create: {
          channelName: externalChannels[0].name,
        },
      },
    });

    accountId = newAccount.id;
  });

  test('syncChannels', async () => {
    const account = await prisma.accounts.findUnique({
      where: { id: accountId },
      include: { slackAuthorizations: true, channels: true },
    });
    if (!account) throw 'missing account';

    const getSlackChannelsSpy = jest
      .spyOn(fetch_all_conversations, 'getSlackChannels')
      .mockReturnValueOnce({
        body: { ok: true, channels: externalChannels },
      } as any);
    const joinChannelSpy = jest
      .spyOn(fetch_all_conversations, 'joinChannel')
      .mockReturnValueOnce({
        body: {},
      } as any);

    const response = await syncChannels({
      token: account.slackAuthorizations[0].accessToken,
      account,
      accountId: account.id,
      getSlackChannels: fetch_all_conversations.getSlackChannels,
      joinChannel: fetch_all_conversations.joinChannel,
      shouldJoinChannel: true,
      logger: console,
    });
    expect(response).toMatchObject(
      externalChannels.map((e) => ({
        channelName: e.name,
        externalChannelId: e.id,
      }))
    );

    expect(getSlackChannelsSpy).toBeCalledTimes(1);
    expect(getSlackChannelsSpy).toHaveBeenNthCalledWith(
      1,
      account.slackTeamId,
      account.slackAuthorizations[0].accessToken
    );

    expect(joinChannelSpy).toBeCalledTimes(CHANNELS_COUNT);
  });
});
