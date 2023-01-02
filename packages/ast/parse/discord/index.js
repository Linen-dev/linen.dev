// Discord uses the `Markdown101` format.
// https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-

const parse = require('../parse');
const { explicit, regexp, deep, shallow, root } = require('../combinators');

const bold = explicit(
  regexp(
    /^\*\*(\S([^**\n]*?|[^**\n]*? `.*?` )\S|\S)\*\*(?=[\s.,\])}!?\-=]|$)/,
    deep('bold', (content) => parse(content, matchers))
  )
);

const italic1 = explicit(
  regexp(
    /^_(\S([^_\n]*?|[^_\n]*? `.*?` )\S|\S)_(?=[\s.,\])}!?\-=]|$)/,
    deep('italic', (content) => parse(content, matchers))
  )
);

const italic2 = explicit(
  regexp(
    /^\*(\S([^*\n]*?|[^*\n]*? `.*?` )\S|\S)\*(?=[\s.,\])}!?\-=]|$)/,
    deep('italic', (content) => parse(content, matchers))
  )
);

const underline = explicit(
  regexp(
    /^__(\S([^__\n]*?|[^__\n]*? `.*?` )\S|\S)__(?=[\s.,\])}!?\-=]|$)/,
    deep('underline', (content) => parse(content, matchers))
  )
);

const strike = explicit(
  regexp(
    /^~~(\S([^~~\n]*?|[^~~\n]*? `.*?` )\S|\S)~~(?=[\s.,\])}!?\-=]|$)/,
    deep('strike', (content) => parse(content, matchers))
  )
);

const spoiler = explicit(
  regexp(
    /^\|\|(\S([^||\n]*?|[^||\n]*? `.*?` )\S|\S)\|\|(?=[\s.,\])}!?\-=]|$)/,
    deep('spoiler', (content) => parse(content, matchers))
  )
);

const code = explicit(
  regexp(/^`([^`]+?)`(?=[\s.,\])}!?\-=]|$)/, shallow('code'))
);

const pre = explicit(
  regexp(/^```(\s*\S[\s\S]*?\s*)```(?=[\s.,\])}!?\-=]|$)/, shallow('pre'))
);

const link1 = explicit(
  regexp(
    /^((https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])(?=[\s.,\])}!?\-=]|$)/gi,
    (match, _, position) => {
      const [result, content] = match;
      const [url, title] = result.split('|')

      return [
        {
          type: 'url',
          url,
          value: result,
          source: result,
          title: title || url,
        },
        position + result.length,
      ];
    }
  )
);

const link2 = explicit(
  regexp(
    /^(mailto:[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])(?=[\s.,\])}!?\-=]|$)/gi,
    (match, _, position) => {
      const [result, content] = match;
      const [url, title] = result.split('|')

      return [
        {
          type: 'url',
          url,
          value: result,
          source: result,
          title: title || url.split(':')[1],
        },
        position + result.length,
      ];
    }
  )
);

const link3 = regexp(
  /^<([^\s<>][^\n<>]*?)(\|([^<>]+?))?>/,
  (match, text, position) => {
    const [result, link, _, label] = match;
    const next = position + result.length;
    const labels = label ? parse(label, matchers) : undefined;

    switch (link[0]) {
      case '@':
        return [
          {
            type: 'user',
            id: link.slice(1),
            label: labels,
            source: result,
          },
          next,
        ];
      case '#':
        return [
          {
            type: 'channel',
            id: link.slice(1),
            label: labels,
            value: link.slice(1) + (label ? `|${label}` : ''),
            source: result,
          },
          next,
        ];
      default:
        return [
          {
            type: 'url',
            url: link,
            label: labels,
            value: link + (label ? `|${label}` : ''),
            source: result,
          },
          next,
        ];
    }
  }
);

const matchers = [
  underline,
  bold,
  italic1,
  italic2,
  strike,
  pre,
  code,
  spoiler,
  link1,
  link2,
  link3,
];

module.exports = function (input) {
  return root(input, parse(input, matchers));
};
