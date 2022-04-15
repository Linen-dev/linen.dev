interface Token {
  type: string;
  value: string;
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const length = input.length;
  let index = 0;
  function current(): string {
    return input[index];
  }
  let type = 'text';
  let value = '';
  while (index < length) {
    value += current();
    index++;
  }
  tokens.push({ type, value });
  return tokens;
}
