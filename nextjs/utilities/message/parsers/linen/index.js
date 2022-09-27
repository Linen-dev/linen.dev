function isWhitespace(character) {
  return /\s/.test(character);
}

function tokenize(input) {
  const tokens = [];
  const length = input.length;
  let index = 0;
  let type = 'text';
  let value = '';

  function flush() {
    if (value) {
      tokens.push({ type, value });
      value = '';
    }
  }

  while (index < length) {
    const current = input[index];
    if (current === '@') {
      if (type === 'code' || type === 'pre') {
        value += current;
      } else {
        const previous = input[index - 1];
        if (!previous || isWhitespace(previous)) {
          value += current;
          type = 'user';
        } else {
          value += current;
        }
      }
    } else if (isWhitespace(current)) {
      if (type === 'user') {
        flush();
        type = 'text';
      }
      value += current;
    } else if (
      current === '`' &&
      input[index + 1] === '`' &&
      input[index + 2] === '`'
    ) {
      if (type === 'pre') {
        value += '```';
        index += 2;
        flush();
        type = 'text';
      } else {
        flush();
        type = 'pre';
        value += '```';
        index += 2;
      }
    } else if (current === '`') {
      if (type === 'pre') {
        value += current;
      } else if (type === 'code') {
        value += current;
        flush();
        type = 'text';
      } else {
        flush();
        type = 'code';
        value += current;
      }
    } else {
      value += current;
    }
    index++;
  }
  flush();
  return tokens;
}

const pattern =
  /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

function split(tokens) {
  const result = [];
  for (let index = 0, length = tokens.length; index < length; index++) {
    const token = tokens[index];
    if (token.type === 'text') {
      const { value } = token;
      const matches = value.match(pattern);

      if (matches) {
        let indexes = [];
        let needles = [];

        for (const match of matches) {
          const start = value.indexOf(match);
          const end = start + match.length;
          indexes.push(start);
          needles.push(start);
          indexes.push(end);
        }

        if (indexes[0] !== 0) {
          indexes.unshift(0);
        }
        if (indexes[indexes.length - 1] !== value.length) {
          indexes.push(value.length);
        }

        for (let index = 0, length = indexes.length; index < length; index++) {
          const current = indexes[index];
          const next = indexes[index + 1];
          if (typeof current === 'number' && typeof next === 'number') {
            const text = value.substring(current, next);
            if (needles.includes(current)) {
              result.push({ type: 'url', value: text });
            } else {
              result.push({ type: 'text', value: text });
            }
          }
        }
      } else {
        result.push(token);
      }
    } else {
      result.push(token);
    }
  }
  return result;
}

// Linen's message parser is a multipass parser
// 1st pass tokenizes the input into text, code and user nodes
// 2nd pass splits text nodes to text nodes or urls

function parse(input) {
  let tokens;
  tokens = tokenize(input);
  tokens = split(tokens);

  return tokens.map(normalize);
}

function normalize(token) {
  if (token.type === 'code') {
    const { value } = token;
    token.value = value.replace(/^`|`$/g, '');
  }
  if (token.type === 'pre') {
    const { value } = token;
    token.value = value.replace(/^```|```$/g, '');
  }
  if (token.type === 'user') {
    const { value } = token;
    token.value = value.replace(/^@/, '');
  }
  return token;
}

export default function (input) {
  return { type: 'root', children: parse(input) };
}
