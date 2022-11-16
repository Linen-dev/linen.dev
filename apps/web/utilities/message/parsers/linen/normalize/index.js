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

export default normalize;
