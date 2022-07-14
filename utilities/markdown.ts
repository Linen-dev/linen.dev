import { Lexer } from 'marked';

export interface Token {
  type: string;
  raw: string;
  text: string;
  depth?: number;
  tokens?: Token[];
}

export function tokenize(markdown: string): Token[] {
  try {
    return Lexer.lex(markdown) as Token[];
  } catch (exception) {
    return [{ type: 'paragraph', text: markdown, raw: markdown }];
  }
}
