// The parser is a state machine that walks the input string, matching
// against the matchers in order.

// The parser has two modes:
//
// - `explicit` mode: when the parser encounters a character that
//   is not a space, punctuation, or a newline, it switches to
//   `explicit` mode.
// - `topline` mode: when the parser encounters a newline, it
//   switches to `topline` mode.
//
// The parser switches between modes as it encounters characters.
//
// The parser flushes the buffer when it matches a new node.
// Nodes can have children. The parser recurses into the children
// when it encounters a node that has children.
//
// The parser returns an abstract syntax tree. The syntax tree
// has a root node and a list of child nodes.

// The parser is based on the one in
// https://github.com/pocka/slack-message-parser/blob/master/LICENSE

import { TextNode } from './types';

function match(input: string, position: number, matchers: any[]) {
  const { length } = matchers;
  for (let index = 0; index < length; index++) {
    const match = matchers[index](input, position);

    if (match) {
      return match;
    }
  }

  return null;
}

function parse(input: string, matchers: any[]) {
  const children = [];
  const length = input.length;

  let index = 0;
  let buffer = '';

  function flush() {
    if (buffer) {
      children.push({
        type: 'text',
        value: buffer,
        source: buffer,
      } as TextNode);
      buffer = '';
    }
  }

  while (index < length) {
    const result = match(input, index, matchers);

    if (result) {
      flush();

      const [node, position] = result;
      children.push(node);
      index = position;
      continue;
    }

    buffer += input[index];
    index++;
  }

  flush();

  return children;
}

export default function (input: string, matchers: any[]) {
  try {
    return parse(input, matchers);
  } catch (exception) {
    return [{ type: 'text', value: input, source: input }];
  }
}
