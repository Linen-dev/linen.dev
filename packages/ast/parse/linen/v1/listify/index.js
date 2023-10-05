function tokenize(input) {
  const tokens = [];
  const length = input.length;
  let index = 0;
  let type = 'text';
  let value = '';
  let newline = true;
  let prefix = '';
  let ordered = false;

  function flush() {
    if (type === 'list') {
      const previous = tokens[tokens.length - 1];
      if (
        previous &&
        previous.type === 'list' &&
        previous.ordered === ordered
      ) {
        previous.source += `\n${prefix} ${value}`;
        previous.children.push({
          type: 'item',
          source: value,
          children: [{ type: 'text', source: value, value }],
        });
      } else {
        tokens.push({
          type: 'list',
          source: `${prefix} ${value}`,
          ordered,
          children: [
            {
              type: 'item',
              source: value,
              children: [{ type: 'text', source: value, value }],
            },
          ],
        });
      }
    } else if (type === 'text') {
      if (value) {
        const previous = tokens[tokens.length - 1];
        if (previous && previous.type === 'text') {
          previous.value += value;
        } else {
          tokens.push({ type, value });
        }
      }
    }
    value = '';
  }

  while (index < length) {
    let current = input[index];
    let next = input[index + 1];
    if (current === '\n') {
      if (type === 'text') {
        value += current;
        flush();
        prefix = '';
      } else if (type === 'list') {
        flush();
        prefix = '';
        type = 'text';
      }
      newline = true;
      index++;
    } else if (newline && ['-', '•'].includes(current) && next === ' ') {
      prefix = current;
      ordered = false;
      type = 'list';
      newline = false;
      index++;
      index++;
    } else if (
      newline &&
      current.match(/\d/) &&
      next === '.' &&
      input[index + 2] === ' '
    ) {
      prefix = current + next;
      ordered = true;
      type = 'list';
      newline = false;
      index++;
      index++;
      index++;
    } else if (newline && current.match(/\d/) && next && next.match(/\d/)) {
      prefix = current;
      while (next && next.match(/\d/)) {
        prefix += next;
        index++;
        current = input[index];
        next = input[index + 1];
      }
      if (next === '.' && input[index + 2] === ' ') {
        prefix += next;
        ordered = true;
        type = 'list';
        newline = false;
        index++;
        index++;
        index++;
      } else if (next === ' ' || next === '\n') {
        value += `\n${prefix}`;
        prefix = '';
        type = 'text';
        index++;
      }
    } else {
      value += current;
      newline = false;
      index++;
    }
  }
  flush();

  return tokens;
}

function splitByList(tokens) {
  const result = [];
  for (let i = 0, ilen = tokens.length; i < ilen; i++) {
    const token = tokens[i];
    if (token.type === 'text') {
      const { value } = token;
      if (
        value.includes('- ') ||
        value.includes('• ') ||
        value.match(/\d+\. /)
      ) {
        tokenize(value).forEach((token) => result.push(token));
      } else {
        result.push(token);
      }
    } else {
      result.push(token);
    }
  }

  return result.filter(Boolean);
}

module.exports = (tokens) => {
  return splitByList(tokens);
};
