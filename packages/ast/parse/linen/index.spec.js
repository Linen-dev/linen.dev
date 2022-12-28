const parse = require('.');
const {
  root,
  code,
  user,
  pre,
  url,
  text,
  bold,
  italic,
  strike,
  quote,
  signal,
  header,
  list,
  item,
} = require('./spec-helpers');

describe('parse', () => {
  it('returns a `text` node', () => {
    expect(parse('foo')).toEqual(root([text('foo')]));
    expect(parse('john@doe.com')).toEqual(root([text('john@doe.com')]));
    expect(parse('@ @')).toEqual(root([text('@ @')]));
    expect(parse('@@')).toEqual(root([text('@@')]));
  });

  it('returns a `bold` node', () => {
    expect(parse('*foo*')).toEqual(root([bold([text('foo')])]));
    expect(parse('foo *foo*')).toEqual(
      root([text('foo '), bold([text('foo')])])
    );
    expect(parse('*foo* foo')).toEqual(
      root([bold([text('foo')]), text(' foo')])
    );
  });

  it('returns an `italic` node', () => {
    expect(parse('_foo_')).toEqual(root([italic([text('foo')])]));
    expect(parse('foo _foo_')).toEqual(
      root([text('foo '), italic([text('foo')])])
    );
    expect(parse('_foo_ foo')).toEqual(
      root([italic([text('foo')]), text(' foo')])
    );
  });

  it('returns a `strike` node', () => {
    expect(parse('~foo~')).toEqual(root([strike([text('foo')])]));
    expect(parse('foo ~foo~')).toEqual(
      root([text('foo '), strike([text('foo')])])
    );
    expect(parse('~foo~ foo')).toEqual(
      root([strike([text('foo')]), text(' foo')])
    );
  });

  it('returns a `code` node', () => {
    expect(parse('`foo`')).toEqual(root([code('foo')]));
    expect(parse('`foo` bar `baz`')).toEqual(
      root([code('foo'), text(' bar '), code('baz')])
    );
    expect(parse('foo `bar` baz')).toEqual(
      root([text('foo '), code('bar'), text(' baz')])
    );
  });

  it('returns a `user` node', () => {
    expect(parse('@uid')).toEqual(root([user('uid')]));
    expect(parse('@uid1 @uid2')).toEqual(
      root([user('uid1'), text(' '), user('uid2')])
    );
    expect(parse('hey @uid1')).toEqual(root([text('hey '), user('uid1')]));
  });

  it('returns a `signal` node', () => {
    expect(parse('!uid')).toEqual(root([signal('uid')]));
    expect(parse('!uid1 !uid2')).toEqual(
      root([signal('uid1'), text(' '), signal('uid2')])
    );
    expect(parse('hey !uid1')).toEqual(root([text('hey '), signal('uid1')]));
  });

  it('returns a `pre` node', () => {
    expect(parse('```foo```')).toEqual(root([pre('foo')]));
    expect(parse('```foo `` bar```')).toEqual(root([pre('foo `` bar')]));
  });

  it('returns a `url` node', () => {
    expect(parse('https://foo.bar')).toEqual(root([url('https://foo.bar')]));
    expect(parse('http://foo.bar')).toEqual(root([url('http://foo.bar')]));
    expect(parse('foo https://bar.baz')).toEqual(
      root([text('foo '), url('https://bar.baz')])
    );
    expect(parse('foo https://bar.baz qux')).toEqual(
      root([text('foo '), url('https://bar.baz'), text(' qux')])
    );
    expect(parse('foo https://bar.baz qux http://quux.quuux')).toEqual(
      root([
        text('foo '),
        url('https://bar.baz'),
        text(' qux '),
        url('http://quux.quuux'),
      ])
    );
    expect(parse('http://foo.bar http://foo.bar')).toEqual(
      root([

        url('http://foo.bar'),
        text(' '),
        url('http://foo.bar')
      ])
    )
    expect(parse('http://foo.bar baz:http://foo.bar')).toEqual(
      root([

        url('http://foo.bar'),
        text(' baz:'),
        url('http://foo.bar')
      ])
    )
  });

  it('returns a `quote` node', () => {
    expect(parse('> foo')).toEqual(root([quote([text('foo')])]));
    expect(parse('> *foo*')).toEqual(root([quote([bold([text('foo')])])]));
    expect(parse('> _foo_')).toEqual(root([quote([italic([text('foo')])])]));
    expect(parse('> ~foo~')).toEqual(root([quote([strike([text('foo')])])]));
  });

  it('returns a `header` node', () => {
    expect(parse('# foo')).toEqual(root([header([text('foo')])]));
    expect(parse('# *foo*')).toEqual(root([header([bold([text('foo')])])]));
    expect(parse('# _foo_')).toEqual(root([header([italic([text('foo')])])]));
    expect(parse('# ~foo~')).toEqual(root([header([strike([text('foo')])])]));

    expect(parse('## foo')).toEqual(root([header([text('foo')], 2)]));
    expect(parse('## *foo*')).toEqual(root([header([bold([text('foo')])], 2)]));
    expect(parse('## _foo_')).toEqual(
      root([header([italic([text('foo')])], 2)])
    );
    expect(parse('## ~foo~')).toEqual(
      root([header([strike([text('foo')])], 2)])
    );

    expect(parse('### foo')).toEqual(root([header([text('foo')], 3)]));
    expect(parse('### *foo*')).toEqual(
      root([header([bold([text('foo')])], 3)])
    );
    expect(parse('### _foo_')).toEqual(
      root([header([italic([text('foo')])], 3)])
    );
    expect(parse('### ~foo~')).toEqual(
      root([header([strike([text('foo')])], 3)])
    );

    expect(parse('#### foo')).toEqual(root([header([text('foo')], 4)]));
    expect(parse('#### *foo*')).toEqual(
      root([header([bold([text('foo')])], 4)])
    );
    expect(parse('#### _foo_')).toEqual(
      root([header([italic([text('foo')])], 4)])
    );
    expect(parse('#### ~foo~')).toEqual(
      root([header([strike([text('foo')])], 4)])
    );

    expect(parse('##### foo')).toEqual(root([header([text('foo')], 5)]));
    expect(parse('##### *foo*')).toEqual(
      root([header([bold([text('foo')])], 5)])
    );
    expect(parse('##### _foo_')).toEqual(
      root([header([italic([text('foo')])], 5)])
    );
    expect(parse('##### ~foo~')).toEqual(
      root([header([strike([text('foo')])], 5)])
    );

    expect(parse('###### foo')).toEqual(root([header([text('foo')], 6)]));
    expect(parse('###### *foo*')).toEqual(
      root([header([bold([text('foo')])], 6)])
    );
    expect(parse('###### _foo_')).toEqual(
      root([header([italic([text('foo')])], 6)])
    );
    expect(parse('###### ~foo~')).toEqual(
      root([header([strike([text('foo')])], 6)])
    );

    expect(parse('####### foo')).toEqual(root([text('####### foo')]));
  });

  it('returns a `list` node', () => {
    expect(parse('- foo')).toEqual(root([list([item([text('foo')])])]));
  })
});
