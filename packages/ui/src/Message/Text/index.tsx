import React from 'react';
import Emoji from '../Emoji';
import Paragraph from './Paragraph';
import Header from '../Header';
import Quote from '../Quote';
import { decodeHTML } from '@linen/utilities/string';
import { tokenize, Token } from '@linen/utilities/markdown';
import { MessageFormat } from '@linen/types';

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
      {tokens.map((token: Token, index: number) => {
        const key = `${token.type}-${token.raw}-${index}`;
        switch (token.type) {
          case 'paragraph':
            return <Paragraph key={key} token={token} />;
          case 'heading':
            return (
              <Header depth={token.depth} key={key}>
                <Emoji text={token.text} />
              </Header>
            );
          case 'blockquote':
            return (
              <Quote key={key}>
                <Paragraph token={token} />
              </Quote>
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
