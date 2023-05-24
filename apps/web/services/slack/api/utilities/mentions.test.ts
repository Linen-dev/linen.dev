import { replaceMentionsWithDisplayName } from './mentions';

describe('replaceMentionsWithDisplayName', () => {
  test('works for one mention', () => {
    expect(
      replaceMentionsWithDisplayName('@1234', [
        { usersId: '1234', users: { displayName: 'John Doe' } },
      ])
    ).toEqual('John Doe');
  });

  test('works for two mentions', () => {
    expect(
      replaceMentionsWithDisplayName('@1234 @5678', [
        { usersId: '1234', users: { displayName: 'John Doe' } },
        { usersId: '5678', users: { displayName: 'Jane Doe' } },
      ])
    ).toEqual('John Doe Jane Doe');
  });

  test('works for one mention that is included multiple times', () => {
    expect(
      replaceMentionsWithDisplayName('@1234 @1234 @1234', [
        { usersId: '1234', users: { displayName: 'John Doe' } },
      ])
    ).toEqual('John Doe John Doe John Doe');
  });
});
