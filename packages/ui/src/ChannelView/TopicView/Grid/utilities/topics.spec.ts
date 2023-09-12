import { groupByThread, toRows } from './topics';

const sentAt = new Date().toISOString();

describe('#groupByThread', () => {
  it('groups topics by thread id', () => {
    const topics = [
      { threadId: '1', messageId: '1', sentAt },
      { threadId: '1', messageId: '2', sentAt },
      { threadId: '2', messageId: '3', sentAt },
      { threadId: '2', messageId: '4', sentAt },
      { threadId: '1', messageId: '5', sentAt },
      { threadId: '1', messageId: '6', sentAt },
    ];
    expect(groupByThread(topics)).toEqual([
      [
        { threadId: '1', messageId: '1', sentAt },
        { threadId: '1', messageId: '2', sentAt },
      ],
      [
        { threadId: '2', messageId: '3', sentAt },
        { threadId: '2', messageId: '4', sentAt },
      ],
      [
        { threadId: '1', messageId: '5', sentAt },
        { threadId: '1', messageId: '6', sentAt },
      ],
    ]);
  });
});

describe('#toRows', () => {
  describe('for one topic', () => {
    it('adds metadata', () => {
      const topics = [[{ threadId: '1', messageId: '1', sentAt }]];
      expect(toRows(topics)).toEqual([
        {
          threadId: '1',
          messageId: '1',
          sentAt,
          first: true,
          last: true,
          padded: false,
        },
      ]);
    });
  });
  it('adds metadata to grouped threads', () => {
    const topics = [
      [
        { threadId: '1', messageId: '1', sentAt },
        { threadId: '1', messageId: '2', sentAt },
        { threadId: '1', messageId: '3', sentAt },
      ],
      [
        { threadId: '2', messageId: '4', sentAt },
        { threadId: '2', messageId: '5', sentAt },
        { threadId: '2', messageId: '6', sentAt },
      ],
    ];
    expect(toRows(topics)).toEqual([
      {
        threadId: '1',
        messageId: '1',
        sentAt,
        first: true,
        last: false,
        padded: false,
      },
      {
        threadId: '1',
        messageId: '2',
        sentAt,
        first: false,
        last: false,
        padded: true,
      },

      {
        threadId: '1',
        messageId: '3',
        sentAt,
        first: false,
        last: true,
        padded: true,
      },
      {
        threadId: '2',
        messageId: '4',
        sentAt,
        first: true,
        last: false,
        padded: false,
      },
      {
        threadId: '2',
        messageId: '5',
        sentAt,
        first: false,
        last: false,
        padded: true,
      },
      {
        threadId: '2',
        messageId: '6',
        sentAt,
        first: false,
        last: true,
        padded: true,
      },
    ]);
  });
});
