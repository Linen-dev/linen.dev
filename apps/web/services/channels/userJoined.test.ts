/**
 * @jest-environment node
 */

import { processMessage } from './userJoined';

describe('processMessage', () => {
  test('2 joins', async () => {
    expect(
      processMessage('Welcome! `user` joined #channelName.', 'anotherUser')
    ).toBe('Welcome! `user` joined #channelName. Also, `anotherUser` joined.');
  });
  test('3 joins', async () => {
    expect(
      processMessage(
        'Welcome! `user` joined #channelName. Also, `anotherUser` joined.',
        'anotherUser2'
      )
    ).toBe(
      'Welcome! `user` joined #channelName. Also, `anotherUser` and `anotherUser2` joined.'
    );
  });
  test('4 joins', async () => {
    expect(
      processMessage(
        'Welcome! `user` joined #channelName. Also, `anotherUser` and `anotherUser2` joined.',
        'anotherUser3'
      )
    ).toBe(
      'Welcome! `user` joined #channelName. Also, `anotherUser`, `anotherUser2` and `anotherUser3` joined.'
    );
  });
  test('5 joins', async () => {
    expect(
      processMessage(
        'Welcome! `user` joined #channelName. Also, `anotherUser`, `anotherUser2` and `anotherUser3` joined.',
        'anotherUser4'
      )
    ).toBe(
      'Welcome! `user` joined #channelName. Also, `anotherUser`, `anotherUser2`, `anotherUser3` and `anotherUser4` joined.'
    );
  });

  test('edge case', async () => {
    expect(
      processMessage('Welcome! `us er` joined #channelName.', 'another User')
    ).toBe(
      'Welcome! `us er` joined #channelName. Also, `another User` joined.'
    );

    expect(
      processMessage('Welcome! `user@ok` joined #channelName.', 'another User@')
    ).toBe(
      'Welcome! `user@ok` joined #channelName. Also, `another User@` joined.'
    );

    expect(
      processMessage(
        'Welcome! `user@ok.com` joined #channelName.',
        'another User@ok'
      )
    ).toBe(
      'Welcome! `user@ok.com` joined #channelName. Also, `another User@ok` joined.'
    );
  });
});
