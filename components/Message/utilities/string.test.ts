import { truncate, normalizeCode } from './string';

describe('#truncate', () => {
  it('truncates text to 223 characters', () => {
    const text = 'foo'.repeat(100);
    const truncated = truncate(text);
    expect(truncated.length).toEqual(223);
    expect(truncated.endsWith('...')).toBeTruthy();
  });

  describe('when text is shorter than 220 characters', () => {
    it('does not truncate it', () => {
      const text = 'foo';
      expect(truncate(text)).toEqual(text);
    });
  });
});

describe('#normalizeCode', () => {
  it('replaces &lt; with <', () => {
    const code = '&lt;';
    expect(normalizeCode(code)).toEqual('<');
  });

  it('replaces &gt; with >', () => {
    const code = '&gt;';
    expect(normalizeCode(code)).toEqual('>');
  });

  it('replaces &amp; with &', () => {
    const code = '&amp;';
    expect(normalizeCode(code)).toEqual('&');
  });

  it('replaces &quot; with "', () => {
    const code = '&quot;';
    expect(normalizeCode(code)).toEqual('"');
  });

  it("replaces &apos; with '", () => {
    const code = '&apos;';
    expect(normalizeCode(code)).toEqual("'");
  });
});
