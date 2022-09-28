import parse from '../../parse';
import { explicit, regexp, topline } from '../../combinators';

export const deep = (type, callback) => (match, _, position) => {
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
  regexp(/^\< (.*)(\n|$)/, (match, _, position) => {
    const [result, content] = match;

    const entity = content.match(/^((\< )+)(.*)$/);

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

const matchers = [bold, italic, strike, quote];

function expand(tokens) {
  return tokens.reduce((result, token) => {
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

export default expand;
