import { cleanUpUrl, slugify } from './util';

const longString = 'THIS Is a really long String'.repeat(100);

describe('slugify', () => {
  it('join spaces', () => {
    expect(slugify(' something space  ')).toEqual('something-space');
  });
  it('removes emojis', () => {
    expect(slugify('something 😉 space ')).toEqual('something-space');
  });
  it('replaces underscores', () => {
    expect(slugify('something_space ')).toEqual('something-space');
  });
  it('has default string', () => {
    expect(slugify(' ')).toEqual('conversation');
  });
  it('handles long strings', () => {
    expect(slugify(longString).length).toEqual(60);
  });

  it('handles punctunations', () => {
    expect(slugify('! @ #$* *#! <> something space @*$(& ')).toEqual(
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
