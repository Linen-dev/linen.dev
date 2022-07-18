import React from 'react';
import ReactEmoji from 'react-emoji-render';
import { Token } from 'utilities/markdown';
import { decodeHTML } from '../../utilities/string';

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
  const text = decodeHTML(token.text);
  return (
    <React.Fragment>
      <ReactEmoji text={text} />
    </React.Fragment>
  );
}

export default Paragraph;
