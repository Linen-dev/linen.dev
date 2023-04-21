import { normalizeFilename } from './files';

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
