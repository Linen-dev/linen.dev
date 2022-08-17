// Discord uses the `Markdown101` format.
// https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-

import parse from '../parse';
import { explicit, regexp, deep, shallow, root } from '../combinators';

const bold = explicit(
  regexp(
    /^\*\*(\S([^**\n]*?|[^**\n]*? `.*?` )\S|\S)\*\*(?=[\s.,\])}!?\-=]|$)/,
    deep('bold', (content: string) => parse(content, matchers))
  )
);

const italic1 = explicit(
  regexp(
    /^_(\S([^_\n]*?|[^_\n]*? `.*?` )\S|\S)_(?=[\s.,\])}!?\-=]|$)/,
    deep('italic', (content: string) => parse(content, matchers))
  )
);

const italic2 = explicit(
  regexp(
    /^\*(\S([^*\n]*?|[^*\n]*? `.*?` )\S|\S)\*(?=[\s.,\])}!?\-=]|$)/,
    deep('italic', (content: string) => parse(content, matchers))
  )
);

const underline = explicit(
  regexp(
    /^__(\S([^__\n]*?|[^__\n]*? `.*?` )\S|\S)__(?=[\s.,\])}!?\-=]|$)/,
    deep('underline', (content: string) => parse(content, matchers))
  )
);

const strike = explicit(
  regexp(
    /^~~(\S([^~~\n]*?|[^~~\n]*? `.*?` )\S|\S)~~(?=[\s.,\])}!?\-=]|$)/,
    deep('strike', (content: string) => parse(content, matchers))
  )
);

const spoiler = explicit(
  regexp(
    /^\|\|(\S([^||\n]*?|[^||\n]*? `.*?` )\S|\S)\|\|(?=[\s.,\])}!?\-=]|$)/,
    deep('spoiler', (content: string) => parse(content, matchers))
  )
);

const code = explicit(
  regexp(/^`([^`]+?)`(?=[\s.,\])}!?\-=]|$)/, shallow('code'))
);

const pre = explicit(
  regexp(/^```(\s*\S[\s\S]*?\s*)```(?=[\s.,\])}!?\-=]|$)/, shallow('pre'))
);

const matchers = [
  underline,
  bold,
  italic1,
  italic2,
  strike,
  pre,
  code,
  spoiler,
];

export default function (input: string) {
  return root(input, parse(input, matchers));
}
