import { getMentionedUsers } from './getMentionedUsers';

describe('slackSync :: getMentionedUsers', () => {
  test('getMentionedUsers', async () => {
    const users = [
      { id: 'string', externalUserId: 'string' },
      { id: 'string2', externalUserId: 'string2' },
    ];
    const text = 'hello <@string> and <@string2>';
    expect(getMentionedUsers(text, users)).toMatchObject([
      { id: 'string', externalUserId: 'string' },
      { id: 'string2', externalUserId: 'string2' },
    ]);
  });
});
