const EMOJI_TAG = ':';

export interface Token {
  type: TokenType;
  value: string;
}

export enum TokenType {
  Emoji = 'emoji',
  Text = 'text',
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const length = input.length;
  let index = 0;
  function current(): string {
    return input[index];
  }
  function push(type: TokenType, value: string): void {
    if (value) {
      tokens.push({ type, value });
    }
  }
  let type = TokenType.Text;
  let value = '';
  while (index < length) {
    if (type === TokenType.Emoji && current() === EMOJI_TAG) {
      index++;
      push(type, value);
      type = TokenType.Text;
      value = '';
    } else if (current() === EMOJI_TAG) {
      push(type, value);
      type = TokenType.Emoji;
      value = '';
    } else {
      value += current();
      index++;
    }
  }
  push(type, value);

  return tokens;
}
