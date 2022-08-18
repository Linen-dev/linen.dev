import parse from '.';
import {
  root,
  text,
  bold,
  italic,
  underline,
  strike,
  code,
  pre,
  spoiler,
  url,
} from './spec-helpers';

describe('parse', () => {
  it('returns a `text` node', () => {
    expect(parse('foo')).toEqual(root([text('foo')]));
  });

  it('returns a `bold` node', () => {
    expect(parse('**foo**')).toEqual(root([bold([text('foo')])]));
  });

  it('returns an `italic` node', () => {
    expect(parse('_foo_')).toEqual(root([italic([text('foo')], '_')]));
    expect(parse('*foo*')).toEqual(root([italic([text('foo')], '*')]));
  });

  it('returns an `underline` node', () => {
    expect(parse('__foo__')).toEqual(root([underline([text('foo')])]));
  });

  it('returns a `strike` node', () => {
    expect(parse('~~foo~~')).toEqual(root([strike([text('foo')])]));
  });

  it('returns a `code` node', () => {
    expect(parse('`foo`')).toEqual(root([code('foo')]));
  });

  it('returns a `pre` node', () => {
    expect(parse('```foo```')).toEqual(root([pre('foo')]));
  });

  it('returns a `spoiler` node', () => {
    expect(parse('||foo||')).toEqual(root([spoiler([text('foo')])]));
  });

  it('returns a `url` node', () => {
    expect(parse('https://foo.com')).toEqual(root([url('https://foo.com')]));
  });

  it('returns a `bold` and `italic` nodes', () => {
    expect(parse('***foo***')).toEqual(
      root([bold([italic([text('foo')], '*')])])
    );
  });

  it('returns an `underline` and `italic` nodes', () => {
    expect(parse('__*foo*__')).toEqual(
      root([underline([italic([text('foo')], '*')])])
    );
  });

  it('returns an `underline` and `bold` nodes', () => {
    expect(parse('__**foo**__')).toEqual(
      root([underline([bold([text('foo')])])])
    );
  });

  it('returns an `underline`, `bold` and `italics` nodes', () => {
    expect(parse('__***foo***__')).toEqual(
      root([underline([bold([italic([text('foo')], '*')])])])
    );
  });

  describe('url', () => {
    it('parses http and mailto as urls', () => {
      expect(parse('Visit http://foo.bar or email to mailto:foo@bar!')).toEqual(
        root([
          text('Visit '),
          url('http://foo.bar'),
          text(' or email to '),
          url('mailto:foo@bar'),
          text('!'),
        ])
      );
    });
  });
});
