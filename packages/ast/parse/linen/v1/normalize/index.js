function normalize(token) {
  if (token.type === 'code') {
    const { value } = token;
    token.source = value;
    token.value = value.replace(/^`|`$/g, '');
  }
  if (token.type === 'pre') {
    const { value } = token;
    token.source = value;
    token.value = value.replace(/^```|```$/g, '');
    const match = token.value.match(/^\w*\s/);
    if (match) {
      const [language] = match;
      token.language = language.trim();
    }
  }
  if (token.type === 'user') {
    const { value } = token;
    token.source = value;
    token.id = value.replace(/^@/, '');
    delete token.value;
  }
  if (token.type === 'signal') {
    const { value } = token;
    token.source = value;
    token.id = value.replace(/^\!/, '');
    delete token.value;
  }
  return token;
}

module.exports = normalize;
