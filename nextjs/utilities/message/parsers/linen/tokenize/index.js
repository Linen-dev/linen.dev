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
        flush();
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

export default tokenize;
