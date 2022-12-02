import React from 'react';
import Emoji from '../../Emoji';
import { Token } from '@linen/utilities/markdown';
import { decodeHTML } from '@linen/utilities/string';

function Whitespace({ raw }: { raw: string }) {
  return <>{raw}</>;
}

function Paragraph({ token }: { token: Token }) {
  if (token.tokens) {
    return (
      <>
        {token.tokens.map((token: Token, index): React.ReactNode => {
          const key = `${token.type}-${token.text}-${index}`;
          switch (token.type) {
            case 'em':
              return (
                <strong key={key}>
                  <Paragraph token={token} />
                </strong>
              );
            default:
              return <Paragraph key={key} token={token} />;
          }
        })}
      </>
    );
  }
  if (!token.text) {
    return <Whitespace raw={token.raw} />;
  }
  const text = decodeHTML(token.text);
  return (
    <React.Fragment>
      <Emoji text={text} />
    </React.Fragment>
  );
}

export default Paragraph;
