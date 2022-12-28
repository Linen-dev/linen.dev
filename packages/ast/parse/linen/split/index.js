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
        let search = value.slice()
        for (const match of matches) {
          const start = search.indexOf(match);
          const end = start + match.length;
          indexes.push(start);
          needles.push(start);
          indexes.push(end);
          search = search.replace(match, '_'.repeat(match.length))
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
              result.push({
                type: 'url',
                url: text,
                value: text,
                source: text,
              });
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

function splitByList (tokens) {
  const result = []
  for (let i = 0, ilen = tokens.length; i < ilen; i++) {
    const token = tokens[i];
    if (token.type === 'text') {
      const { value } = token;
      const lines = value.split(/\r?\n/)
      lines.forEach((line) => {
        if (line.startsWith('- ')) {
          const value = line.substr(2)
          result.push({
            type: 'list',
            children: [
              {
                type: 'item',
                children: [
                  {
                    type: 'text',
                    value,
                    source: value
                  }
                ],
                source: value
              }
            ],
            source: line
          })
        } else {
          result.push({ type: 'text', value: line, source: line })
        }
      })
    } else {
      result.push(token)
    }
  }
  return result
}

module.exports = (tokens) => {
  const result = splitByPattern(tokens, /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi)
  return splitByList(result)
};
