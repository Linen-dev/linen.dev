function splitByPattern(tokens, pattern) {
  const result = [];
  for (let index = 0, length = tokens.length; index < length; index++) {
    const token = tokens[index];
    if (token.type === 'text') {
      const { value } = token;
      const matches = value.match(pattern);

      if (matches) {
        let indexes = [];
        let needles = [];
        let search = value.slice();
        for (const match of matches) {
          const start = search.indexOf(match);
          const end = start + match.length;
          indexes.push(start);
          needles.push(start);
          indexes.push(end);
          search = search.replace(match, '_'.repeat(match.length));
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
              if (text.startsWith('[') && text.endsWith(')')) {
                const title = text.substring(1, text.indexOf(']'));
                const url = text.substring(
                  text.indexOf('(') + 1,
                  text.lastIndexOf(')')
                );
                result.push({
                  type: 'url',
                  url: url,
                  value: url,
                  source: text,
                  title: title,
                });
              } else {
                const [url, title] = text.split('|');
                result.push({
                  type: 'url',
                  url: url,
                  value: url,
                  source: title ? `${url}|${title}` : url,
                  title: title || url,
                });
              }
            } else {
              result.push({ type: 'text', value: text, source: text });
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
    if (value) {
      if (type === 'list') {
        const previous = tokens[tokens.length - 1];
        if (previous && previous.type === 'list') {
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

        value = '';
      } else {
        tokens.push({ type, value });
        value = '';
      }
    }
  }

  while (index < length) {
    const current = input[index];
    const next = input[index + 1];

    if (current === '\n') {
      if (type === 'list') {
        flush();
        type === 'text';
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
    } else if (type === 'list') {
      value += current;
      newline = false;
      index++;
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

  for (let i = 1, ilen = result.length; i < ilen; i++) {
    const previous = result[i - 1];
    const current = result[i];
    if (previous.type === 'text' && current.type === 'text') {
      current.value = `${previous.value}\n${current.value}`;
      current.source = `${previous.source}\n${current.source}`;
      result[i - 1] = null;
    }
  }

  return result.filter(Boolean);
}

module.exports = (tokens) => {
  let result = splitByPattern(
    tokens,
    /\[([\w\s\d]+)\]\((\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])\)/gi
  );
  result = splitByPattern(
    result,
    /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
  );
  return splitByList(result);
};
