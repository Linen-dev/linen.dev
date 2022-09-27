import parse from '.';
import { root, code, user, pre, url, text } from './spec-helpers';

describe('parse', () => {
  it('returns a `text` node', () => {
    expect(parse('foo')).toEqual(root([text('foo')]));
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
  });

  it('returns a `pre` node', () => {
    expect(parse('```foo```')).toEqual(root([pre('foo')]));
    expect(parse('```foo `` bar```')).toEqual(root([pre('foo `` bar')]));
  });

  it('returns a `url` node', () => {
    // expect(parse('https://foo.bar')).toEqual(root([url('https://foo.bar')]));
    // expect(parse('http://foo.bar')).toEqual(root([url('http://foo.bar')]));
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
  });
});
