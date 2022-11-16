import { decodeHTML } from './string';

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
