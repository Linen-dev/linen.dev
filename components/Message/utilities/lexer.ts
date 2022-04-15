const START_TAG = '<';
const END_TAG = '>';
const MENTION_TAG = '@';
const CHANNEL_TAG = '!';
const CHANNEL_NAME_TAG = '#';

export interface Token {
  type: TokenType;
  value: string;
}

export enum TokenType {
  Text = 'text',
  Mention = 'mention',
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const length = input.length;
  let index = 0;
  function current(): string {
    return input[index];
  }
  function next(): string | undefined {
    return input[index + 1];
  }
  let type = TokenType.Text;
  let value = '';
  while (index < length) {
    if (current() === START_TAG && next() === MENTION_TAG) {
      if (value) {
        tokens.push({ type, value });
      }
      type = TokenType.Mention;
      value = '';
      index += 2;
    } else if (current() === END_TAG) {
      tokens.push({ type, value });
      type = TokenType.Text;
      value = '';
      index++;
    } else {
      value += current();
      index++;
    }
  }
  if (value) {
    tokens.push({ type, value });
  }
  return tokens;
}
