import { decodeHTML, truncate } from './string';

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
