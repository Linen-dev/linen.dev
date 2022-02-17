import { Text } from '@mantine/core';
import React from 'react';
import LinkRangeText from './LinkRangeText';

export default function MessageRangeText({ text, boldIndicator }) {
  const textArray = text.split(boldIndicator);
  if (textArray.length < 3) {
    return <LinkRangeText text={text} />;
  }

  return (
    <Text component="span" size="sm">
      {textArray.map((item, index) => {
        return (
          <React.Fragment key={index}>
            {index % 2 === 0 && <LinkRangeText text={item} />}
            {index % 2 === 1 && <b>{item}</b>}
          </React.Fragment>
        );
      })}
    </Text>
  );
}
