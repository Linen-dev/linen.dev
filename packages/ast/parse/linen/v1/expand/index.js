const parse = require('../../../parse');
const { explicit, regexp, topline } = require('../../../combinators');

const deep = (type, callback) => (match, _, position) => {
  const [result, content] = match;

  return [
    {
      type,
      children: callback(content),
      source: result,
    },
    position + result.length,
  ];
};

const bold = explicit(
  regexp(
    /^\*(\S([^*\n]*?|[^*\n]*? `.*?` )\S|\S)\*(?=[\s.,\])}!?\-=]|$)/,
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
  regexp(/^\> (.*)(\n|$)/, (match, _, position) => {
    const [result] = match;
    const content = result.substr(2);

    return [
      {
        type: 'quote',
        children: parse(content, matchers),
        source: result,
      },
      position + result.length,
    ];
  })
);

const header = topline(
  regexp(/^\#{1,6} (.*)(\n|$)/, (match, _, position) => {
    const [result] = match;
    const depth = result.split(' ')[0].length;
    const content = result.substr(depth + 1);

    return [
      {
        type: 'header',
        depth,
        children: parse(content, matchers),
        source: result,
      },
      position + result.length,
    ];
  })
);

const matchers = [bold, italic, strike, quote, header];

function expand(tokens) {
  return tokens.reduce((result, token) => {
    if (token.children) {
      token.children = expand(token.children);
    }
    if (token.type === 'text') {
      const { value } = token;
      const nodes = parse(value, matchers);
      nodes.forEach((node) => result.push(node));
    } else {
      result.push(token);
    }
    return result;
  }, []);
}

module.exports = expand;
