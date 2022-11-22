const regexp = (pattern, callback) => (text, position) => {
  const match = text.substring(position).match(pattern);

  if (!match) {
    return null;
  }

  return callback(match, text, position);
};

const explicit = (matcher) => (text, position) => {
  const previous = text[position - 1];

  if (previous && !previous.match(/[\s.,([{!?\-=]/)) {
    return null;
  }

  return matcher(text, position);
};

const topline = (matcher) => (text, position) => {
  if (position > 0 && text.charAt(position - 1) !== '\n') {
    return null;
  }

  return matcher(text, position);
};

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

const shallow = (type) => (match, _, position) => {
  const [result, content] = match;

  return [
    {
      type,
      value: content,
      source: result,
    },
    position + result.length,
  ];
};

const root = (input, children) => ({
  type: 'root',
  children,
  source: input,
});

module.exports = {
  regexp,
  explicit,
  topline,
  deep,
  shallow,
  root,
};
