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

// The parser is a simplified version of the one in
// https://github.com/pocka/slack-message-parser/blob/master/LICENSE
import {
  Node,
  RootNode,
  BoldNode,
  TextNode,
  UserNode,
  ChannelNode,
  CommandNode,
  LinkNode,
  ItalicNode,
  StrikeNode,
  QuoteNode,
  CodeNode,
  PreNode,
  EmojiNode,
} from 'utilities/message/parsers/slack/types';

export const regexp =
  (pattern: RegExp, callback: any) => (text: string, position: number) => {
    const match = text.substring(position).match(pattern);

    if (!match) {
      return null;
    }

    return callback(match, text, position);
  };

const explicit = (matcher: any) => (text: string, position: number) => {
  const previous = text[position - 1];

  if (previous && !previous.match(/[\s.,([{!?\-=]/)) {
    return null;
  }

  return matcher(text, position);
};

const topline = (matcher: any) => (text: string, position: number) => {
  if (position > 0 && text.charAt(position - 1) !== '\n') {
    return null;
  }

  return matcher(text, position);
};

const bold = explicit(
  regexp(
    /^\*(\S([^*\n]*?|[^*\n]*? `.*?` )\S|\S)\*(?=[\s.,\])}!?\-=]|$)/,
    (
      match: [string, string],
      _: string,
      position: number
    ): [BoldNode, number] => {
      const [result, content] = match;

      return [
        {
          type: 'bold',
          children: parse(content),
          source: result,
        },
        position + result.length,
      ];
    }
  )
);

const code = explicit(
  regexp(
    /^`([^`]+?)`(?=[\s.,\])}!?\-=]|$)/,
    (match: [string, string], _: string, position: number) => {
      const [result, content] = match;

      return [
        {
          type: 'code',
          value: content,
          source: result,
        },
        position + result.length,
      ];
    }
  )
);

const pre = explicit(
  regexp(
    /^```(\s*\S[\s\S]*?\s*)```(?=[\s.,\])}!?\-=]|$)/,
    (match: [string, string], _: string, position: number) => {
      const [result, content] = match;

      return [
        {
          type: 'pre',
          value: content,
          source: result,
        },
        position + result.length,
      ];
    }
  )
);

const italic = explicit(
  regexp(
    /^_(\S([^_\n]*?|[^_\n]*? `.*?` )\S|\S)\_(?=[\s.,\])}!?\-=]|$)/,
    (
      match: [string, string],
      _: string,
      position: number
    ): [ItalicNode, number] => {
      const [result, content] = match;

      return [
        {
          type: 'italic',
          children: parse(content),
          source: result,
        },
        position + result.length,
      ];
    }
  )
);

const strike = explicit(
  regexp(
    /^~(\S([^~\n]*?|[^~\n]*? `.*?` )\S|\S)\~(?=[\s.,\])}!?\-=]|$)/,
    (
      match: [string, string],
      _: string,
      position: number
    ): [StrikeNode, number] => {
      const [result, content] = match;

      return [
        {
          type: 'strike',
          children: parse(content),
          source: result,
        },
        position + result.length,
      ];
    }
  )
);

const quote = topline(
  regexp(
    /^&gt;(.*)(\n|$)/,
    (
      match: [string, string],
      _: string,
      position: number
    ): [QuoteNode, number] => {
      const [result, content] = match;

      const entity = content.match(/^((&gt;)+)(.*)$/);

      return [
        {
          type: 'quote',
          children: entity
            ? [
                {
                  type: 'text',
                  value: entity[1],
                  source: entity[1],
                },
                ...parse(entity[3]),
              ]
            : parse(content),
          source: result,
        },
        position + result.length,
      ];
    }
  )
);

const emoji = regexp(
  /^:([^:<`*#@!\s()$%]+):(:(skin-tone-.+?):)?/,
  (
    match: [string, string, string, string],
    text: string,
    position: number
  ): [EmojiNode, number] => {
    const [result, name, _, variation] = match;

    return [
      {
        type: 'emoji',
        name,
        variation,
        source: result,
      },
      position + result.length,
    ];
  }
);

const link = regexp(
  /^<([^\s<>][^\n<>]*?)(\|([^<>]+?))?>/,
  (
    match: [string, string, string, string],
    text: string,
    position: number
  ): [UserNode | ChannelNode | CommandNode | LinkNode, number] => {
    const [result, link, _, label] = match;
    const next = position + result.length;
    const labels = label ? parse(label) : undefined;

    switch (link[0]) {
      case '@':
        return [
          {
            type: 'user',
            id: link.slice(1),
            label: labels,
            source: result,
          },
          next,
        ] as [UserNode, number];
      case '#':
        return [
          {
            type: 'channel',
            id: link.slice(1),
            label: labels,
            value: link.slice(1) + (label ? `|${label}` : ''),
            source: result,
          },
          next,
        ] as [ChannelNode, number];
      case '!':
        const [name, ...args] = link.slice(1).split('^');

        return [
          {
            type: 'command',
            name: name,
            arguments: args,
            label: labels,
            source: result,
          },
          next,
        ] as [CommandNode, number];
      default:
        return [
          {
            type: 'url',
            url: link,
            label: labels,
            value: link + (label ? `|${label}` : ''),
            source: result,
          },
          next,
        ] as [LinkNode, number];
    }
  }
);

const matchers = [bold, pre, code, emoji, italic, quote, link, strike];

function match(input: string, position: number) {
  const { length } = matchers;
  for (let index = 0; index < length; index++) {
    const match = matchers[index](input, position);

    if (match) {
      return match;
    }
  }

  return null;
}

function parse(input: string): Node[] {
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
      });
      buffer = '';
    }
  }

  while (index < length) {
    const result = match(input, index);

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

export default function (input: string): RootNode {
  return {
    type: 'root',
    children: parse(input),
    source: input,
  };
}
