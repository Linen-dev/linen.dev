import { Text } from '@mantine/core';
import React from 'react';
import Emoji from 'react-emoji-render';
import LinkRangeText from './LinkRangeText';

export default function MessageRangeText({ text }: { text: string }) {
  const textArray = text.split(/<b>(.*?)<\/b>/);
  if (textArray.length < 3) {
    return <LinkRangeText text={text} />;
  }

  return (
    <p className="break-words">
      {textArray.map((item: string, index: number) => {
        return (
          <React.Fragment key={index}>
            {index % 2 === 0 && <LinkRangeText text={item} />}
            {index % 2 === 1 && (
              <b>
                <Emoji text={item} />
              </b>
            )}
          </React.Fragment>
        );
      })}
    </p>
  );
}
