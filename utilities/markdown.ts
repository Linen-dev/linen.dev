import { Lexer } from 'marked';

interface Token {
  type: string;
  raw: string;
  text: string;
  depth?: number;
}

export function tokenize(markdown: string): Token[] {
  try {
    return Lexer.lex(markdown) as Token[];
  } catch (exception) {
    return [{ type: 'paragraph', text: markdown, raw: markdown }];
  }
}
