import { decodeHTML, getLetter, pad, slugify, truncate } from './string';

describe('#decodeHTML', () => {
  it('replaces &lt; with <', () => {
    const code = '&lt;';
    expect(decodeHTML(code)).toEqual('<');
  });

  it('replaces &gt; with >', () => {
    const code = '&gt;';
    expect(decodeHTML(code)).toEqual('>');
  });

  it('replaces &amp; with &', () => {
    const code = '&amp;';
    expect(decodeHTML(code)).toEqual('&');
  });

  it('replaces &quot; with "', () => {
    const code = '&quot;';
    expect(decodeHTML(code)).toEqual('"');
  });

  it("replaces &apos; with '", () => {
    const code = '&apos;';
    expect(decodeHTML(code)).toEqual("'");
  });

  it('is idempotent', () => {
    const code = '&lt;';
    expect(decodeHTML(decodeHTML(code))).toEqual('<');
  });

  describe('when text is undefined', () => {
    it('returns an empty string', () => {
      expect(decodeHTML(undefined)).toEqual('');
    });
  });
});

describe('truncate', () => {
  it('truncates a string', () => {
    expect(truncate('foo', 2)).toEqual('fo...');
  });

  it('does not truncate a string if it is less than the limit', () => {
    expect(truncate('foo', 4)).toEqual('foo');
  });

  it('does not truncate a string if it equals the limit', () => {
    expect(truncate('foo', 3)).toEqual('foo');
  });
});

describe('pad', () => {
  it('pads the string with 0', () => {
    expect(pad('1', 2)).toEqual('01');
    expect(pad('1', 3)).toEqual('001');
    expect(pad('1', 4)).toEqual('0001');
    expect(pad('1', 5)).toEqual('00001');
  });

  it('does nothing if string has the required length', () => {
    expect(pad('11', 2)).toEqual('11');
    expect(pad('111', 2)).toEqual('111');
    expect(pad('1111', 2)).toEqual('1111');
    expect(pad('11111', 2)).toEqual('11111');
  });
});

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
    expect(slugify('x'.repeat(100)).length).toEqual(60);
  });

  it('handles punctunations', () => {
    expect(slugify('! @ #$* *#! <> something space @*$(& ')).toEqual(
      'something-space'
    );
  });
});

describe('getLetter', () => {
  it('returns the first letter, lowercased', () => {
    expect(getLetter('Anna')).toEqual('a');
    expect(getLetter('Ben')).toEqual('b');
    expect(getLetter('Ceslav')).toEqual('c');
    expect(getLetter('Daana')).toEqual('d');
    expect(getLetter('Emil')).toEqual('e');
    expect(getLetter('Faakhir')).toEqual('f');
    expect(getLetter('Gaadhi')).toEqual('g');
    expect(getLetter('Iaicchik')).toEqual('i');
    expect(getLetter('John')).toEqual('j');
    expect(getLetter('Kam')).toEqual('k');
    expect(getLetter('Sandro')).toEqual('s');
    expect(getLetter('Thomas')).toEqual('t');
    expect(getLetter('Quentin')).toEqual('q');
  });

  it('returns the first letter, lowercased, of special characters', () => {
    expect(getLetter('Łukasz')).toEqual('ł');
    expect(getLetter('Øyvind')).toEqual('ø');
    expect(getLetter('Żaneta')).toEqual('ż');
  });

  it('trims the display name', () => {
    expect(getLetter('   John   ')).toEqual('j');
  });

  describe('when display name starts with a number', () => {
    it('returns `u` as the letter', () => {
      expect(getLetter('1Tom')).toEqual('u');
    });
  });

  describe('when display name starts with a chinese letter', () => {
    it('returns `u` as the letter', () => {
      expect(getLetter('孫')).toEqual('u');
    });
  });
});
