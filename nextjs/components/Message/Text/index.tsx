import React from 'react';
import Emoji from '../Emoji';
import Paragraph from './Paragraph';
import { decodeHTML } from '../utilities/string';
import { tokenize, Token } from 'utilities/markdown';
import { MessageFormat } from '@prisma/client';

interface Props {
  value: string;
  format?: MessageFormat;
}

export default function Text({ format, value }: Props) {
  if (format === MessageFormat.LINEN) {
    return <>{value}</>;
  }
  const text = decodeHTML(value);
  const tokens = tokenize(text);
  return (
    <>
      {tokens.map((token: Token, index) => {
        const key = `${token.type}-${token.raw}-${index}`;
        switch (token.type) {
          case 'paragraph':
            return <Paragraph key={key} token={token} />;
          case 'heading':
            switch (token.depth) {
              case 1:
                return (
                  <h1 className="text-xl font-bold mb-3" key={key}>
                    <Emoji text={token.text} />
                  </h1>
                );
              case 2:
                return (
                  <h2 className="text-lg font-bold mb-3" key={key}>
                    <Emoji text={token.text} />
                  </h2>
                );
              case 3:
                return (
                  <h3 className="text-md font-bold mb-3" key={key}>
                    <Emoji text={token.text} />
                  </h3>
                );
              case 4:
                return (
                  <h4 className="text-sm font-bold mb-3" key={key}>
                    <Emoji text={token.text} />
                  </h4>
                );
              case 5:
                return (
                  <h5 className="text-xs font-bold mb-3" key={key}>
                    <Emoji text={token.text} />
                  </h5>
                );
              case 6:
                return (
                  <h6 className="text-xs font-bold mb-3" key={key}>
                    <Emoji text={token.text} />
                  </h6>
                );
              default:
                return <React.Fragment key={key}>{token.raw}</React.Fragment>;
            }
          case 'blockquote':
            return (
              <blockquote
                className="bg-gray-100 border-l-4 border-gray-300 border-solid p-3 my-3"
                key={key}
              >
                <Paragraph token={token} />
              </blockquote>
            );
          case 'space':
            return <React.Fragment key={key}>{token.raw}</React.Fragment>;
          case 'table':
            return <pre key={key}>{token.raw}</pre>;
          default:
            return <Emoji key={key} text={token.raw} />;
        }
      })}
    </>
  );
}
