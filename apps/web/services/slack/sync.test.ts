process.env.SKIP_NOTIFICATION = 'true';

import { prismaMock } from '__tests__/singleton';
import { slackSync } from './sync';

describe('slackSync', () => {
  test('account not found', async () => {
    try {
      const accountsFindUniqueMock =
        prismaMock.accounts.findUnique.mockResolvedValue(null);
      expect(
        slackSync({
          accountId: 'notExist',
          logger: console,
        })
      ).rejects.toThrowError('Account not found');
      expect(accountsFindUniqueMock).toHaveBeenCalledWith({
        where: {
          id: 'notExist',
        },
        include: {
          slackAuthorizations: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          channels: true,
        },
      });
    } catch (error) {
      console.error(error);
      expect(error).toBe(null);
    }
  });
});
