import { groupByThread, toRows } from './topics';

const sentAt = new Date().toISOString();

describe('#groupByThread', () => {
  it('groups topics by thread id', () => {
    const topics = [
      { threadId: '1', messageId: '1', usersId: '1', sentAt },
      { threadId: '1', messageId: '2', usersId: '2', sentAt },
      { threadId: '2', messageId: '3', usersId: '3', sentAt },
      { threadId: '2', messageId: '4', usersId: '4', sentAt },
      { threadId: '1', messageId: '5', usersId: '5', sentAt },
      { threadId: '1', messageId: '6', usersId: '6', sentAt },
    ];
    expect(groupByThread(topics)).toEqual([
      [
        { threadId: '1', messageId: '1', usersId: '1', sentAt },
        { threadId: '1', messageId: '2', usersId: '2', sentAt },
      ],
      [
        { threadId: '2', messageId: '3', usersId: '3', sentAt },
        { threadId: '2', messageId: '4', usersId: '4', sentAt },
      ],
      [
        { threadId: '1', messageId: '5', usersId: '5', sentAt },
        { threadId: '1', messageId: '6', usersId: '6', sentAt },
      ],
    ]);
  });
});

describe('#toRows', () => {
  describe('for one topic', () => {
    it('adds metadata', () => {
      const topics = [
        [{ threadId: '1', messageId: '1', usersId: '1', sentAt }],
      ];
      expect(toRows(topics)).toEqual([
        {
          threadId: '1',
          messageId: '1',
          usersId: '1',
          sentAt,
          first: true,
          last: true,
          padded: false,
          avatar: true,
        },
      ]);
    });
  });

  describe('for two topics from same user', () => {
    it('adds metadata', () => {
      const topics = [
        [
          { threadId: '1', messageId: '1', usersId: '1', sentAt },
          { threadId: '1', messageId: '2', usersId: '1', sentAt },
        ],
      ];
      expect(toRows(topics)).toEqual([
        {
          threadId: '1',
          messageId: '1',
          usersId: '1',
          sentAt,
          first: true,
          last: false,
          padded: false,
          avatar: true,
        },
        {
          threadId: '1',
          messageId: '2',
          usersId: '1',
          sentAt,
          first: false,
          last: true,
          padded: false,
          avatar: false,
        },
      ]);
    });
  });

  describe('for a topic between two users', () => {
    it('adds metadata', () => {
      const topics = [
        [
          { threadId: '1', messageId: '1', usersId: '1', sentAt },
          { threadId: '1', messageId: '2', usersId: '1', sentAt },
          { threadId: '1', messageId: '3', usersId: '2', sentAt },
          { threadId: '1', messageId: '4', usersId: '1', sentAt },
        ],
      ];
      expect(toRows(topics)).toEqual([
        {
          threadId: '1',
          messageId: '1',
          usersId: '1',
          sentAt,
          first: true,
          last: false,
          padded: false,
          avatar: true,
        },
        {
          threadId: '1',
          messageId: '2',
          usersId: '1',
          sentAt,
          first: false,
          last: false,
          padded: false,
          avatar: false,
        },
        {
          threadId: '1',
          messageId: '3',
          usersId: '2',
          sentAt,
          first: false,
          last: false,
          padded: true,
          avatar: true,
        },
        {
          threadId: '1',
          messageId: '4',
          usersId: '1',
          sentAt,
          first: false,
          last: true,
          padded: true,
          avatar: true,
        },
      ]);
    });
  });

  describe('for topics without user id', () => {
    it('sets the avatar to true', () => {
      const topics = [
        [
          { threadId: '1', messageId: '1', sentAt },
          { threadId: '1', messageId: '2', sentAt },
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
          avatar: true,
        },
        {
          threadId: '1',
          messageId: '2',
          sentAt,
          first: false,
          last: true,
          padded: true,
          avatar: true,
        },
      ]);
    });
  });

  it('adds metadata to grouped threads', () => {
    const topics = [
      [
        { threadId: '1', messageId: '1', usersId: '1', sentAt },
        { threadId: '1', messageId: '2', usersId: '2', sentAt },
        { threadId: '1', messageId: '3', usersId: '3', sentAt },
      ],
      [
        { threadId: '2', messageId: '4', usersId: '4', sentAt },
        { threadId: '2', messageId: '5', usersId: '5', sentAt },
        { threadId: '2', messageId: '6', usersId: '6', sentAt },
      ],
    ];
    expect(toRows(topics)).toEqual([
      {
        threadId: '1',
        messageId: '1',
        usersId: '1',
        sentAt,
        first: true,
        last: false,
        padded: false,
        avatar: true,
      },
      {
        threadId: '1',
        messageId: '2',
        usersId: '2',
        sentAt,
        first: false,
        last: false,
        padded: true,
        avatar: true,
      },

      {
        threadId: '1',
        messageId: '3',
        usersId: '3',
        sentAt,
        first: false,
        last: true,
        padded: true,
        avatar: true,
      },
      {
        threadId: '2',
        messageId: '4',
        usersId: '4',
        sentAt,
        first: true,
        last: false,
        padded: false,
        avatar: true,
      },
      {
        threadId: '2',
        messageId: '5',
        usersId: '5',
        sentAt,
        first: false,
        last: false,
        padded: true,
        avatar: true,
      },
      {
        threadId: '2',
        messageId: '6',
        usersId: '6',
        sentAt,
        first: false,
        last: true,
        padded: true,
        avatar: true,
      },
    ]);
  });
});
