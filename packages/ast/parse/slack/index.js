// Slack uses the `mrkdwn` format.
// https://api.slack.com/reference/surfaces/formatting

const parse = require('../parse');
const {
  explicit,
  regexp,
  topline,
  deep,
  shallow,
  root,
} = require('../combinators');

const code = explicit(
  regexp(/^`([^`]+?)`(?=[\s.,\])}!?\-=]|$)/, shallow('code'))
);

const pre = explicit(
  regexp(/^```(\s*\S[\s\S]*?\s*)```(?=[\s.,\])}!?\-=]|$)/, shallow('pre'))
);

const bold = explicit(
  regexp(
    /^\*(\S([^*\n]*?|[^*\n]*? `.*?` )\S|\S)\*(?=[\s.,\])}!?\-=:]|$)/,
    deep('bold', (content) => parse(content, matchers))
  )
);

const italic = explicit(
  regexp(
    /^_(\S([^_\n]*?|[^_\n]*? `.*?` )\S|\S)\_(?=[\s.,\])}!?\-=]|$)/,
    deep('italic', (content) => parse(content, matchers))
  )
);

const strike = explicit(
  regexp(
    /^~(\S([^~\n]*?|[^~\n]*? `.*?` )\S|\S)\~(?=[\s.,\])}!?\-=]|$)/,
    deep('strike', (content) => parse(content, matchers))
  )
);

const quote = topline(
  regexp(/^&gt;(.*)(\n|$)/, (match, _, position) => {
    const [result, content] = match;

    const entity = content.match(/^((&gt;)+)(.*)$/);

    return [
      {
        type: 'quote',
        children: entity
          ? [
              {
                type: 'text',
                value: entity[1],
                source: entity[1],
              },
              ...parse(entity[3], matchers),
            ]
          : parse(content, matchers),
        source: result,
      },
      position + result.length,
    ];
  })
);

const emoji = regexp(
  /^:([^:<`*#@!\s()$%"']+):(:(skin-tone-.+?):)?/,
  (match, text, position) => {
    const [result, name, _, variation] = match;

    return [
      {
        type: 'emoji',
        name,
        variation,
        source: result,
      },
      position + result.length,
    ];
  }
);

const link = regexp(
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
      case '!':
        const [name, ...args] = link.slice(1).split('^');

        return [
          {
            type: 'command',
            name: name,
            arguments: args,
            label: labels,
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
            title: label || link,
          },
          next,
        ];
    }
  }
);

const matchers = [bold, pre, code, emoji, italic, quote, link, strike];

module.exports = function (input) {
  return root(input, parse(input, matchers));
};
