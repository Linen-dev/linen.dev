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
        const lines = value.split(/\r?\n/);
        for (let j = 0, jlen = lines.length; j < jlen; j++) {
          const line = lines[j];
          if (
            line.startsWith('- ') ||
            line.startsWith('• ') ||
            line.match(/^\d+\. /)
          ) {
            const index = line.indexOf(' ') + 1;
            const value = line.substr(index);
            const list = {
              type: 'list',
              ordered: index >= 3,
              children: [
                {
                  type: 'item',
                  children: [
                    {
                      type: 'text',
                      value,
                      source: value,
                    },
                  ],
                  source: value,
                },
              ],
              source: line,
            };
            let next = lines[j + 1];
            while (
              next &&
              (next.startsWith('- ') ||
                next.startsWith('• ') ||
                next.match(/^\d+\. /))
            ) {
              const index = next.indexOf(' ') + 1;
              const value = next.substr(index);
              list.children.push({
                type: 'item',
                children: [
                  {
                    type: 'text',
                    value,
                    source: value,
                  },
                ],
                source: value,
              });
              list.source += `\n${next}`;
              j += 1;
              next = lines[j + 1];
            }
            result.push(list);
          } else {
            const last = j == jlen - 1;
            const string = last ? line : `${line}\n`;
            result.push({ type: 'text', value: string, source: string });
          }
        }
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
