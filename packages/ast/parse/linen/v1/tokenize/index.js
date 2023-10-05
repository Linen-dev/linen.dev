function isWhitespace(character) {
  return /\s/gi.test(character);
}

function isSpecialCharacter(character) {
  return ['!', '?', '.', ','].includes(character);
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

    function serialize(tag, node) {
      if (type === 'code' || type === 'pre') {
        value += current;
      } else {
        const previous = input[index - 1];
        const next = input[index + 1];
        if (next === tag || isWhitespace(next)) {
          value += current;
        } else if (next && (!previous || isWhitespace(previous))) {
          flush();
          value += current;
          type = node;
        } else {
          value += current;
        }
      }
    }

    if (current === '@' && !['user', 'signal'].includes(type)) {
      serialize('@', 'user');
    } else if (current === '!' && !['user', 'signal'].includes(type)) {
      serialize('!', 'signal');
    } else if (isWhitespace(current) || isSpecialCharacter(current)) {
      if (type === 'user' || type === 'signal') {
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

module.exports = tokenize;
