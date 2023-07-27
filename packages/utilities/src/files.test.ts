import { getImageDimensionsFromUrl, isImage, normalizeFilename } from './files';

describe('getImageDimensionsFromUrl', () => {
  describe('when the url does not have dimensions', () => {
    it('returns null', () => {
      expect(getImageDimensionsFromUrl('https://foo.com/bar.png')).toEqual(
        null
      );
      expect(getImageDimensionsFromUrl('https://foo.com')).toEqual(null);
    });
  });

  describe('when the url has dimensions', () => {
    it('returns the width and height', () => {
      expect(
        getImageDimensionsFromUrl('https://foo.com/bar_100x100.png')
      ).toEqual({ width: 100, height: 100 });
      expect(
        getImageDimensionsFromUrl('https://foo.com/bar_800x600.png')
      ).toEqual({ width: 800, height: 600 });
    });
  });

  describe('when the dimensions are broken', () => {
    it('returns null', () => {
      expect(getImageDimensionsFromUrl('https://foo.com/bar_0x0.png')).toEqual(
        null
      );
      expect(
        getImageDimensionsFromUrl('https://foo.com/bar_0x100.png')
      ).toEqual(null);
      expect(
        getImageDimensionsFromUrl('https://foo.com/bar_fooxbar.png')
      ).toEqual(null);
    });
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
