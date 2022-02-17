import { Text } from '@mantine/core';
import React from 'react';
import Emoji from 'react-emoji-render';
import LinkRangeText from './LinkRangeText';

export default function MessageRangeText({ text }) {
  const textArray = text.split(/<b>(.*)?<\/b>/);
  if (textArray.length < 3) {
    return <LinkRangeText text={text} />;
  }

  return (
    <Text component="span" size="sm">
      {textArray.map((item, index) => {
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
    </Text>
  );
}
