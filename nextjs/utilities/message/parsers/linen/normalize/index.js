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
    token.value = value.replace(/^@/, '');
  }
  return token;
}

export default normalize;
