import { Anchor, Code, Text } from '@mantine/core';
import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const codeify = (item) => {
  // const href = item.match(/href=(.*?)>/)[1];
  // const text = item.match(/>(.*?)<\/link>/)[1];
  console.log('codify item :>> ', item);

  return <Code size="sm">{'lol'}</Code>;
};

export default function LinkRangeText({ text }) {
  const textArray = text.split(/(<code>.*?\/code>)/);
  console.log('textArray :>> ', textArray);
  if (textArray.length < 3) {
    return (
      <Text component="span" size="sm">
        {text}
      </Text>
    );
  }

  return (
    <Text component="span" size="sm">
      {textArray.map((item, index) => {
        return (
          <React.Fragment key={index}>
            {index % 2 === 0 && item}
            {index % 2 === 1 && codeify(item)}
          </React.Fragment>
        );
      })}
    </Text>
  );
}
