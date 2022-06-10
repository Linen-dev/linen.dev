export const START_TAG = '<';
export const END_TAG = '>';
export const MENTION_TAG = '@';
export const LINK_TAG = 'h';
export const BASIC_CHANNEL_TAG = '!';
export const COMPLEX_CHANNEL_TAG = '#';
export const HORIZONTAL_RULE_TAG = '-';
export const BACKTICK = '`';

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
  InlineCode = 'inline_code',
  BlockCode = 'block_code',
  HorizontalRule = 'horizontal_rule',
}

function isTagSupported(tag: string): boolean {
  return (
    tag === MENTION_TAG ||
    tag === LINK_TAG ||
    tag === BASIC_CHANNEL_TAG ||
    tag === COMPLEX_CHANNEL_TAG ||
    tag === HORIZONTAL_RULE_TAG
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
    case HORIZONTAL_RULE_TAG:
      return TokenType.HorizontalRule;
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
  function next(count = 1): string {
    return input[index + count];
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
      type !== TokenType.InlineCode &&
      type !== TokenType.BlockCode
    ) {
      push(type, value);
      type = getTokenType(next());
      value = '';
      index += 2;
    } else if (
      current() === END_TAG &&
      type !== TokenType.InlineCode &&
      type !== TokenType.BlockCode
    ) {
      tokens.push({ type, value });
      type = TokenType.Text;
      value = '';
      index++;
    } else if (
      current() === BACKTICK &&
      next() === BACKTICK &&
      next(2) === BACKTICK
    ) {
      push(type, value);
      if (type === TokenType.BlockCode) {
        type = TokenType.Text;
      } else {
        type = TokenType.BlockCode;
      }
      value = '';
      index += 3;
    } else if (
      current() === BACKTICK &&
      (type === TokenType.Text || type === TokenType.InlineCode)
    ) {
      push(type, value);
      if (type === TokenType.InlineCode) {
        type = TokenType.Text;
      } else {
        type = TokenType.InlineCode;
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
    .reduce((result: Token[], token: Token) => {
      if (token.type === TokenType.Text) {
        tokenizeText(token.value).forEach((item) => result.push(item));
      } else if (token.type === TokenType.Link) {
        const url = `h${token.value}`;
        if (isValidUrl(url)) {
          result.push({
            type: TokenType.Link,
            value: url,
          });
        }
      } else {
        result.push(token);
      }
      return result;
    }, [])
    .filter(Boolean) as Token[];
}

function tokenizeText(value: string): Token[] {
  const tokens = [];
  const parts = value.split(/(http?:\/\/[^\s]+|https?:\/\/[^\s]+)/);
  if (parts.length > 1) {
    parts.forEach((part) => {
      if (isValidUrl(part)) {
        tokens.push({ type: TokenType.Link, value: part });
      } else {
        tokens.push({ type: TokenType.Text, value: part });
      }
    });
  } else {
    tokens.push({ type: TokenType.Text, value });
  }
  return tokens;
}
