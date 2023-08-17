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

module.exports = (tokens) => {
  let result = splitByPattern(
    tokens,
    /\[([\w\s\d]+)\]\((\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])\)/gi
  );
  return splitByPattern(
    result,
    /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
  );
};
