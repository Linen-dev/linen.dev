const START_TAG = '<';
const END_TAG = '>';
const MENTION_TAG = '@';
const LINK_TAG = 'h';
const BASIC_CHANNEL_TAG = '!';
const COMPLEX_CHANNEL_TAG = '#';
const BACKTICK = '`';

export interface Token {
  type: TokenType;
  value: string;
}

export enum TokenType {
  Text = 'text',
  Mention = 'mention',
  Link = 'link',
  BasicChannel = 'channel',
  ComplexChannel = 'complex_channel',
  Code = 'code',
}

function isTagSupported(tag: string): boolean {
  return (
    tag === MENTION_TAG ||
    tag === LINK_TAG ||
    tag === BASIC_CHANNEL_TAG ||
    tag === COMPLEX_CHANNEL_TAG
  );
}

function getTokenType(tag: string): TokenType {
  switch (tag) {
    case MENTION_TAG:
      return TokenType.Mention;
    case LINK_TAG:
      return TokenType.Link;
    case BASIC_CHANNEL_TAG:
      return TokenType.BasicChannel;
    case COMPLEX_CHANNEL_TAG:
      return TokenType.ComplexChannel;
    default:
      return TokenType.Text;
  }
}

function isValidUrl(url: string) {
  return url.startsWith('http://') || url.startsWith('https://');
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const length = input.length;
  let index = 0;
  function current(): string {
    return input[index];
  }
  function next(): string {
    return input[index + 1];
  }
  function push(type: TokenType, value: string): void {
    if (value) {
      tokens.push({ type, value });
    }
  }
  let type = TokenType.Text;
  let value = '';
  while (index < length) {
    if (
      current() === START_TAG &&
      isTagSupported(next()) &&
      type !== TokenType.Code
    ) {
      push(type, value);
      type = getTokenType(next());
      value = '';
      index += 2;
    } else if (current() === END_TAG && type !== TokenType.Code) {
      tokens.push({ type, value });
      type = TokenType.Text;
      value = '';
      index++;
    } else if (
      current() === BACKTICK &&
      (type === TokenType.Text || type === TokenType.Code)
    ) {
      push(type, value);
      if (type === TokenType.Code) {
        type = TokenType.Text;
      } else {
        type = TokenType.Code;
      }
      value = '';
      index++;
    } else {
      value += current();
      index++;
    }
  }
  push(type, value);

  return tokens
    .map((token) => {
      if (token.type === TokenType.Link) {
        const url = `h${token.value}`;
        if (isValidUrl(url)) {
          return {
            type: TokenType.Link,
            value: url,
          };
        } else {
          return null;
        }
      }
      return token;
    })
    .filter(Boolean) as Token[];
}
