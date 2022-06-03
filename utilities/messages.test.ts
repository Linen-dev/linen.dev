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
    expect(result[0].body).toEqual('foo<-hr>bar');
  });

  it('does not merge messages without an author', () => {
    const messages = [
      {
        id: '1',
        channelId: '1',
        slackMessageId: '1',
        slackThreadId: '1',
        createdAt: new Date(),
        sentAt: new Date(),
        usersId: null,
        body: 'foo',
      },
      {
        id: '2',
        channelId: '1',
        slackMessageId: '2',
        slackThreadId: '1',
        createdAt: new Date(),
        sentAt: new Date(),
        usersId: null,
        body: 'bar',
      },
    ];
    const result = mergeMessagesByUserId(messages);
    expect(result.length).toEqual(2);
  });

  describe('when messages are in an desc order', () => {
    it('merges messages of one author', () => {
      const messages = [
        {
          id: '4',
          channelId: '1',
          slackMessageId: '4',
          slackThreadId: '1',
          createdAt: new Date(),
          sentAt: new Date(),
          usersId: '2',
          body: 'qux',
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
          id: '1',
          channelId: '1',
          slackMessageId: '1',
          slackThreadId: '1',
          createdAt: new Date(),
          sentAt: new Date(),
          usersId: '1',
          body: 'foo',
        },
      ];
      const result = mergeMessagesByUserId(messages, 'desc');
      expect(result.length).toEqual(2);
      expect(result[0].body).toEqual('baz<-hr>qux');
    });
  });
});
