import { isImage, normalizeFilename } from './files';

describe('#normalizeFilename', () => {
  it('converts special characters to _', () => {
    expect(normalizeFilename('foo/bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo&bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo"bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename("foo'bar.png")).toEqual('foo_bar.png');
    expect(normalizeFilename('foo`bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo>bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo<bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo(bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo)bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo[bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo]bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo;bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo:bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo bar.png')).toEqual('foo_bar.png');
    expect(normalizeFilename('foo/&"\'`><<div> bar.png')).toEqual(
      'foo________div__bar.png'
    );
  });
});

describe('isImage', () => {
  describe('when href is an image', () => {
    it('returns true', () => {
      expect(isImage('http://google.com/image.png')).toBe(true);
      expect(isImage('https://google.com/image.png')).toBe(true);
    });
  });

  describe('when href is not an image', () => {
    it('returns false', () => {
      expect(isImage('http://google.com/main.css')).toBe(false);
      expect(isImage('https://google.com/main.css')).toBe(false);
      expect(isImage('https://google.com/main')).toBe(false);
    });
  });
});
