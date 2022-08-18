jest.mock('../../fetch_all_conversations');
import { fetchToken } from './fetchToken';
import * as fetch_all_conversations from 'fetch_all_conversations';

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
      })
    ).toBe('token123');
    expect(fetchTeamInfoSpy).toBeCalledTimes(1);
  });
});
