import { replaceMentions } from './replaceMentions';

describe('replace mentions', () => {
  test('replace', () => {
    expect(
      replaceMentions({
        body: 'remove-me something something remove-me',
        mentions: [
          {
            externalUserId: 'remove-me',
            displayName: 'new-me',
          } as any,
        ],
      })
    ).toBe('new-me something something new-me');

    expect(
      replaceMentions({
        body: '',
        mentions: [
          {
            externalUserId: 'remove-me',
            displayName: 'new-me',
          } as any,
        ],
      })
    ).toBe('');

    expect(
      replaceMentions({
        body: null,
        mentions: [
          {
            externalUserId: 'remove-me',
            displayName: 'new-me',
          } as any,
        ],
      })
    ).toBe(null);

    expect(
      replaceMentions({
        body: '',
        mentions: [
          {
            externalUserId: 'remove-me',
            displayName: 'new-me',
          } as any,
        ],
      })
    ).toBe('');

    expect(
      replaceMentions({
        body: '',
        mentions: null as any,
      })
    ).toBe('');

    expect(
      replaceMentions({
        body: 'remove-me something something remove-me',
        mentions: [],
      })
    ).toBe('remove-me something something remove-me');

    expect(
      replaceMentions({
        body: 'remove-me something something remove-me',
        mentions: null as any,
      })
    ).toBe('remove-me something something remove-me');
  });
});
