import { cleanUpUrl, createSlug } from './util';

const longString = 'THIS Is a really long String'.repeat(100);

describe('slugify', () => {
  it('join spaces', () => {
    expect(createSlug(' something space  ')).toEqual('something-space');
  });
  it('removes emojis', () => {
    expect(createSlug('something 😉 space ')).toEqual('something-space');
  });
  it('replaces underscores', () => {
    expect(createSlug('something_space ')).toEqual('something-space');
  });
  it('has default string', () => {
    expect(createSlug(' ')).toEqual('conversation');
  });
  it('handles long strings', () => {
    expect(createSlug(longString).length).toEqual(60);
  });

  it('handles punctunations', () => {
    expect(createSlug('! @ #$* *#! <> something space @*$(& ')).toEqual(
      'something-space'
    );
  });
});

describe('cleanUpUrl', () => {
  test('clean up customDomain', () => {
    expect(cleanUpUrl('/?customDomain=1')).toBe('/');
    expect(cleanUpUrl('/?customDomain=1&something=2')).toBe('/?something=2');
    expect(cleanUpUrl('/')).toBe('/');
    expect(cleanUpUrl()).toBe(undefined);
  });
});
