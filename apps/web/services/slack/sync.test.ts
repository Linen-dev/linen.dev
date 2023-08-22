jest.mock('services/accounts/sync');
import { slackSync } from './sync';

describe('slackSync', () => {
  test('account not found', async () => {
    expect(() =>
      slackSync({
        accountId: 'notExist',
        logger: console,
      })
    ).rejects.toThrowError('Account not found');
  });
});
