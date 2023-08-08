const parse = require('.');
const {
  root,
  text,
  bold,
  italic,
  strike,
  code,
  pre,
  user,
  channel,
  command,
  quote,
  emoji,
  url,
} = require('./spec-helpers');

describe('parse', () => {
  it('returns a `text` node', () => {
    expect(parse('foo')).toEqual(root([text('foo')]));
  });

  it('returns a `bold` node', () => {
    expect(parse('*foo*')).toEqual(root([bold([text('foo')])]));
  });

  it('returns an `italic` node', () => {
    expect(parse('_foo_')).toEqual(root([italic([text('foo')])]));
  });

  it('returns a `strike` node', () => {
    expect(parse('~foo~')).toEqual(root([strike([text('foo')])]));
  });

  it('returns a `code` node', () => {
    expect(parse('`foo`')).toEqual(root([code('foo')]));
  });

  it('returns a `pre` node', () => {
    expect(parse('```foo```')).toEqual(root([pre('foo')]));
  });

  it('returns a `user` node', () => {
    expect(parse('<@uid>')).toEqual(root([user('uid')]));
  });

  it('returns a `channel` node', () => {
    expect(parse('<#cid>')).toEqual(root([channel('cid')]));
  });

  it('returns a `command` node', () => {
    expect(parse('<!foo>')).toEqual(root([command('foo')]));
  });

  it('returns a `url` node', () => {
    expect(parse('<http://foo.com>')).toEqual(root([url('http://foo.com')]));
  });

  it('returns a `quote` node', () => {
    expect(parse('&gt;foo')).toEqual(root([quote([text('foo')])]));
  });

  it('returns an `emoji` node', () => {
    expect(parse(':foo:')).toEqual(root([emoji('foo')]));
  });

  describe('bold', () => {
    it('parses "foo *bar* baz" as a bold node', () => {
      expect(parse('foo *bar* baz')).toEqual(
        root([text('foo '), bold([text('bar')]), text(' baz')])
      );
    });

    it('does not parse "foo*bar*baz" as a bold node', () => {
      expect(parse('foo*bar*baz')).toEqual(root([text('foo*bar*baz')]));
    });

    it('does not parse "*foo*bar" as bold node', () => {
      expect(parse('*foo*bar')).toEqual(root([text('*foo*bar')]));
    });

    it('does not parse "foo * bar * baz" as a bold node', () => {
      expect(parse('foo * bar * baz')).toEqual(root([text('foo * bar * baz')]));
    });
  });

  describe('italic', () => {
    it('parses "foo _bar_ baz" as a italic node', () => {
      expect(parse('foo _bar_ baz')).toEqual(
        root([text('foo '), italic([text('bar')]), text(' baz')])
      );
    });

    it('does not parse "foo_bar_baz" as a italic node', () => {
      expect(parse('foo_bar_baz')).toEqual(root([text('foo_bar_baz')]));
    });

    it('does not parse "_foo_bar" as italic node', () => {
      expect(parse('_foo_bar')).toEqual(root([text('_foo_bar')]));
    });

    it('does not parse "foo _ bar _ baz" as a italic node', () => {
      expect(parse('foo _ bar _ baz')).toEqual(root([text('foo _ bar _ baz')]));
    });
  });

  describe('strike', () => {
    it('parses "foo ~bar~ baz" as a strike node', () => {
      expect(parse('foo ~bar~ baz')).toEqual(
        root([text('foo '), strike([text('bar')]), text(' baz')])
      );
    });

    it('does not parse "foo~bar~baz" as a strike node', () => {
      expect(parse('foo~bar~baz')).toEqual(root([text('foo~bar~baz')]));
    });

    it('does not parse "~foo~bar" as strike node', () => {
      expect(parse('~foo~bar')).toEqual(root([text('~foo~bar')]));
    });

    it('does not parse "foo ~ bar ~ baz" as a strike node', () => {
      expect(parse('foo ~ bar ~ baz')).toEqual(root([text('foo ~ bar ~ baz')]));
    });
  });

  describe('code', () => {
    it('parses "`foo`" as a code node', () => {
      expect(parse('`foo`')).toEqual(root([code('foo')]));
    });

    it('parses "` foo `" as a code node', () => {
      expect(parse('` foo `')).toEqual(root([code(' foo ')]));
    });

    it('parses "` foo ` bar ` baz `" as two code nodes', () => {
      expect(parse('` foo ` bar ` baz `')).toEqual(
        root([code(' foo '), text(' bar '), code(' baz ')])
      );
    });

    it('parses "` `" as a code node', () => {
      expect(parse('` `')).toEqual(root([code(' ')]));
    });

    it('does not parse "foo`bar`baz" as a code node', () => {
      expect(parse('foo`bar`baz')).toEqual(root([text('foo`bar`baz')]));
    });
  });

  describe('pre', () => {
    it('parses "```foo```" as a pre node', () => {
      expect(parse('```foo```')).toEqual(root([pre('foo')]));
    });

    it('parses "``` foo ```" as a pre node', () => {
      expect(parse('``` foo ```')).toEqual(root([pre(' foo ')]));
    });

    it('parses "``` foo ``` bar ``` baz ```" as two pre nodes', () => {
      expect(parse('``` foo ``` bar ``` baz ```')).toEqual(
        root([pre(' foo '), text(' bar '), pre(' baz ')])
      );
    });

    it('does not parse "``` ```" as a pre node', () => {
      expect(parse('``` ```')).toEqual(root([text('``` ```')]));
    });

    it('does not parse "foo```bar```baz" as a pre node', () => {
      expect(parse('foo```bar```baz')).toEqual(root([text('foo```bar```baz')]));
    });
  });

  describe('url', () => {
    it('parses command arguments', () => {
      expect(parse('<!foo^bar>')).toEqual(root([command('foo', ['bar'])]));
    });

    it('parses http and mailto as urls', () => {
      expect(
        parse('Visit <http://foo.bar> or email to <mailto:foo@bar>')
      ).toEqual(
        root([
          text('Visit '),
          url('http://foo.bar'),
          text(' or email to '),
          url('mailto:foo@bar'),
        ])
      );
    });

    it('parses urls with underscores', () => {
      expect(parse('<http://foo/bar_baz>')).toEqual(
        root([url('http://foo/bar_baz')])
      );
    });

    it('parses link labels', () => {
      expect(parse('<http://foo|bar>')).toEqual(
        root([url('http://foo', [text('bar')])])
      );
    });

    it('parses text in label', () => {
      expect(parse('<http://foo|*bar ~baz~*>')).toEqual(
        root([url('http://foo', [bold([text('bar '), strike([text('baz')])])])])
      );
    });

    it('does not parse nested links', () => {
      expect(parse('<http://foo|<http://bar>>')).toEqual(
        root([text('<http://foo|'), url('http://bar'), text('>')])
      );
    });
  });

  describe('emoji', () => {
    it('parses "foo :bar: baz" as a emoji node', () => {
      expect(parse('foo :bar: baz')).toEqual(
        root([text('foo '), emoji('bar'), text(' baz')])
      );
    });

    it('parses emoji with skin-tone variation', () => {
      expect(parse(':foo::skin-tone-1:')).toEqual(
        root([emoji('foo', 'skin-tone-1')])
      );
    });

    it('parses sequential emojis', () => {
      expect(parse('ab:cd::ef::skin-tone-1:g:h::i:jk')).toEqual(
        root([
          text('ab'),
          emoji('cd'),
          emoji('ef', 'skin-tone-1'),
          text('g'),
          emoji('h'),
          emoji('i'),
          text('jk'),
        ])
      );
    });

    it('parses "foo:bar:baz" as a emoji node', () => {
      expect(parse('foo:bar:baz')).toEqual(
        root([text('foo'), emoji('bar'), text('baz')])
      );
    });

    it('does not parse invalid emoji names', () => {
      expect(parse('(11/3 - 4:30pm): ok')).toEqual(
        root([text('(11/3 - 4:30pm): ok')])
      );
      expect(parse('{"foo":"bar","baz":"qux"}')).toEqual(
        root([text('{"foo":"bar","baz":"qux"}')])
      );
      expect(parse("{'foo':'bar','baz':'qux'}")).toEqual(
        root([text("{'foo':'bar','baz':'qux'}")])
      );
    });
  });

  describe('quote', () => {
    it('parses quote text', () => {
      expect(parse('&gt; foo *bar*')).toEqual(
        root([quote([text(' foo '), bold([text('bar')])], true)])
      );
    });

    it('parses quote locate in second line', () => {
      expect(parse('foo\n&gt;bar')).toEqual(
        root([text('foo\n'), quote([text('bar')], true)])
      );
    });

    it('parses "&gt;&gt;&gt;" as quoted "&gt;&gt;"', () => {
      expect(parse('&gt;&gt;&gt;')).toEqual(
        root([quote([text('&gt;&gt;')], true)])
      );
    });

    it('does not parse "foo&gt;bar" as a quote node', () => {
      expect(parse('foo&gt;bar')).toEqual(root([text('foo&gt;bar')]));
    });
  });

  describe('Punctuations', () => {
    it('parses "?" as a delimiter', () => {
      expect(parse('*foo*?')).toEqual(root([bold([text('foo')]), text('?')]));
    });

    it('parses "!" as a delimiter', () => {
      expect(parse('*foo*!')).toEqual(root([bold([text('foo')]), text('!')]));
    });

    it('parses "." as a delimiter', () => {
      expect(parse('*foo*.')).toEqual(root([bold([text('foo')]), text('.')]));
    });

    it('parses ":" as a delimiter', () => {
      expect(parse('*foo*:')).toEqual(root([bold([text('foo')]), text(':')]));
    });

    it('parses "()" as a delimiter', () => {
      expect(parse('(*foo*)')).toEqual(
        root([text('('), bold([text('foo')]), text(')')])
      );
      expect(parse(')*foo*(')).toEqual(root([text(')*foo*(')]));
    });

    it('parses "[]" as a delimiter', () => {
      expect(parse('[*foo*]')).toEqual(
        root([text('['), bold([text('foo')]), text(']')])
      );
      expect(parse(']*foo*[')).toEqual(root([text(']*foo*[')]));
    });

    it('parses "{}" as a delimiter', () => {
      expect(parse('{*foo*}')).toEqual(
        root([text('{'), bold([text('foo')]), text('}')])
      );
      expect(parse('}*foo*{')).toEqual(root([text('}*foo*{')]));
    });

    it('parses "-" or "="  as delimiters', () => {
      expect(parse('-*foo*=')).toEqual(
        root([text('-'), bold([text('foo')]), text('=')])
      );
    });
  });
});
