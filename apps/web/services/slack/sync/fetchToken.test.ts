jest.mock('@linen/database');
jest.mock('services/slack/api');
import { fetchToken } from './fetchToken';
import * as fetch_all_conversations from 'services/slack/api';
const account = {
  id: 'accountId123',
  slackTeamId: 'slackTeamId123',
  slackAuthorizations: [{ accessToken: 'token123' }],
};

describe('slackSync :: fetchToken', () => {
  test('fetchToken', async () => {
    const fetchTeamInfoSpy = jest
      .spyOn(fetch_all_conversations, 'fetchTeamInfo')
      .mockReturnValueOnce({ body: { team: {} } } as any);
    expect(
      await fetchToken({
        account,
        accountId: account.id,
        fetchTeamInfo: fetch_all_conversations.fetchTeamInfo,
      })
    ).toStrictEqual({
      shouldJoinChannel: true,
      syncFrom: new Date(0),
      token: 'token123',
    });
    expect(fetchTeamInfoSpy).toBeCalledTimes(1);
  });
});
