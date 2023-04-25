export const EXAMPLE = `
# Markdown syntax in Linen

## Headings

To create headings, add a \`#\` symbol and a space \` \` before your heading text. The number of \`#\` will define the size of the heading.

\`\`\`
# h1
## h2
### h3
#### h4
##### h5
###### h6
\`\`\`

# h1
## h2
### h3
#### h4
##### h5
###### h6

## Text styling

You can style text with bold, italic and strike.

\`\`\`
Hello, *world*!
Hello, _world_!
Hello, ~world~!
Hello, *_world_*!
Hello, *_~world~_*!
\`\`\`
Hello, *world*!
Hello, _world_!
Hello, ~world~!
Hello, *_world_*!
Hello, *_~world~_*!

## Code

You can create inline or code blocks. Inline code uses a single backtick character \`&#96;\`, code blocks use three backtick characters \`&#96;&#96;&#96;\`. Code blocks are automatically highlighted, inline code is not.

\`\`\`
import React from 'react'

export default function Button ({ children }) {
  return <button>{children}</button>
}
\`\`\`
\`const answer = 42\`

## Quote

You can quote text with \`>\`.

> Lorem ipsum dolor sit amet

## Links

To make link usage as simple as possible, there are three ways of defining links.

\`\`\`
Standard:
https://linen.dev
Single word:
https://linen.dev|linen
Multiple words:
[linen website](https://linen.dev)
\`\`\`
Standard:
https://linen.dev
Single word:
https://linen.dev|linen
Multiple words:
[linen website](https://linen.dev)

## Images, vidoes and other content

To display images, videos or other content, simply include their url in the message.

\`https://linen.dev/images/logo/linen.png\`

https://linen.dev/images/logo/linen.png
## Lists

We support unordered and ordered lists.

\`\`\`
- foo
- bar
- baz
\`\`\`

- foo
- bar
- baz

\`\`\`
1. foo
2. bar
3. baz
\`\`\`

1. foo
2. bar
3. baz

## Mentions

You can mention someone by specifying their username, e.g. \`@kam\`. Mentions don't send notifications.

## Signals

You can request someones attention by using a signal, e.g. \`!kam\`. Signals send notifications.
`.trim();
