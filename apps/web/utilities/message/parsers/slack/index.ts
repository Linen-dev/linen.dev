// Slack uses the `mrkdwn` format.
// https://api.slack.com/reference/surfaces/formatting

import parse from '../parse';
import { explicit, regexp, topline, deep, shallow, root } from '../combinators';
import {
  RootNode,
  UserNode,
  ChannelNode,
  CommandNode,
  LinkNode,
  QuoteNode,
  EmojiNode,
} from 'utilities/message/parsers/types';

const code = explicit(
  regexp(/^`([^`]+?)`(?=[\s.,\])}!?\-=]|$)/, shallow('code'))
);

const pre = explicit(
  regexp(/^```(\s*\S[\s\S]*?\s*)```(?=[\s.,\])}!?\-=]|$)/, shallow('pre'))
);

const bold = explicit(
  regexp(
    /^\*(\S([^*\n]*?|[^*\n]*? `.*?` )\S|\S)\*(?=[\s.,\])}!?\-=]|$)/,
    deep('bold', (content: string) => parse(content, matchers))
  )
);

const italic = explicit(
  regexp(
    /^_(\S([^_\n]*?|[^_\n]*? `.*?` )\S|\S)\_(?=[\s.,\])}!?\-=]|$)/,
    deep('italic', (content: string) => parse(content, matchers))
  )
);

const strike = explicit(
  regexp(
    /^~(\S([^~\n]*?|[^~\n]*? `.*?` )\S|\S)\~(?=[\s.,\])}!?\-=]|$)/,
    deep('strike', (content: string) => parse(content, matchers))
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
                ...parse(entity[3], matchers),
              ]
            : parse(content, matchers),
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
    const labels = label ? parse(label, matchers) : undefined;

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

export default function (input: string): RootNode {
  return root(input, parse(input, matchers));
}
