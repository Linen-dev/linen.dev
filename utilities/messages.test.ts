import { mergeMessagesByUserId } from './messages';

describe('#mergeMessagesByUserId', () => {
  it('merges messages of one author', () => {
    const messages = [
      {
        id: '1',
        channelId: '1',
        slackMessageId: '1',
        slackThreadId: '1',
        createdAt: new Date(),
        sentAt: new Date(),
        usersId: '1',
        body: 'foo',
      },
      {
        id: '2',
        channelId: '1',
        slackMessageId: '2',
        slackThreadId: '1',
        createdAt: new Date(),
        sentAt: new Date(),
        usersId: '1',
        body: 'bar',
      },
      {
        id: '3',
        channelId: '1',
        slackMessageId: '3',
        slackThreadId: '1',
        createdAt: new Date(),
        sentAt: new Date(),
        usersId: '2',
        body: 'baz',
      },
      {
        id: '4',
        channelId: '1',
        slackMessageId: '4',
        slackThreadId: '1',
        createdAt: new Date(),
        sentAt: new Date(),
        usersId: '1',
        body: 'qux',
      },
    ];
    const result = mergeMessagesByUserId(messages);
    expect(result.length).toEqual(3);
    expect(result[0].body).toEqual('foo\nbar');
  });
});
