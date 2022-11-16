jest.mock('services/slack/api');

import { prismaMock } from '__tests__/singleton';
import { syncChannels } from './syncChannels';
import * as fetch_all_conversations from 'services/slack/api';
import { conversationList } from '__mocks__/slack-api';

const account = {
  id: 'accountId123',
  slackTeamId: 'slackTeamId123',
  slackAuthorizations: [{ accessToken: 'token123' }],
};

const externalChannels = conversationList.channels.map(({ id, name }) => {
  return { name, id };
});

const internalChannel = {
  id: 'uuid123',
  channelName: externalChannels[0].name,
  externalPageCursor: null,
  externalChannelId: externalChannels[0].id,
};

const internalChannel2 = {
  id: 'uuid234',
  channelName: externalChannels[1].name,
  externalPageCursor: 'completed',
  externalChannelId: externalChannels[1].id,
};

const internalChannel3 = {
  id: 'uuid345',
  channelName: externalChannels[2].name,
  externalPageCursor: 'completed',
  externalChannelId: externalChannels[2].id,
};

describe('slackSync :: syncChannels', () => {
  test('syncChannels', async () => {
    const getSlackChannelsSpy = jest
      .spyOn(fetch_all_conversations, 'getSlackChannels')
      .mockReturnValueOnce({
        body: conversationList,
      } as any);
    const joinChannelSpy = jest
      .spyOn(fetch_all_conversations, 'joinChannel')
      .mockReturnValueOnce({
        body: {},
      } as any);
    const channelsCreateManyMock =
      prismaMock.channels.createMany.mockResolvedValue({} as any);
    const channelsFindManyMock = prismaMock.channels.findMany.mockResolvedValue(
      [internalChannel, internalChannel2, internalChannel3] as any
    );
    const response = await syncChannels({
      token: account.slackAuthorizations[0].accessToken,
      account,
      accountId: account.id,
      getSlackChannels: fetch_all_conversations.getSlackChannels,
      joinChannel: fetch_all_conversations.joinChannel,
    });
    expect(response).toMatchObject([
      internalChannel,
      internalChannel2,
      internalChannel3,
    ]);

    expect(getSlackChannelsSpy).toBeCalledTimes(1);
    expect(getSlackChannelsSpy).toHaveBeenNthCalledWith(
      1,
      account.slackTeamId,
      account.slackAuthorizations[0].accessToken
    );

    expect(joinChannelSpy).toBeCalledTimes(1);
    expect(joinChannelSpy).toHaveBeenNthCalledWith(
      1,
      internalChannel.externalChannelId,
      account.slackAuthorizations[0].accessToken
    );

    expect(channelsFindManyMock).toBeCalledTimes(1);
    expect(channelsFindManyMock).toHaveBeenCalledWith({
      where: {
        accountId: account.id,
      },
    });
    expect(channelsCreateManyMock).toBeCalledTimes(1);
    expect(channelsCreateManyMock).toHaveBeenNthCalledWith(1, {
      data: [
        {
          externalChannelId: externalChannels[0].id,
          channelName: externalChannels[0].name,
          accountId: account.id,
        },
        {
          externalChannelId: externalChannels[1].id,
          channelName: externalChannels[1].name,
          accountId: account.id,
        },
        {
          externalChannelId: externalChannels[2].id,
          channelName: externalChannels[2].name,
          accountId: account.id,
        },
      ],
      skipDuplicates: true,
    });
  });
});
