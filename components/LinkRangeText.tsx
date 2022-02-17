import { Anchor, Text } from '@mantine/core';
import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import CodeRangeText from './CodeRangeText';

const linkify = (item) => {
  const href = item.match(/href=(.*?)>/)[1];
  const text = item.match(/>(.*?)<\/link>/)[1];

  return (
    <Anchor underline size="sm" href={href} target="_blank">
      {text}
    </Anchor>
  );
};

export default function LinkRangeText({ text }) {
  const textArray = text.split(/(<link.*?\/link>)/);
  if (textArray.length < 3) {
    return <CodeRangeText text={text} />;
  }

  return (
    <Text component="span" size="sm">
      {textArray.map((item, index) => {
        return (
          <React.Fragment key={index}>
            {index % 2 === 0 && <CodeRangeText text={item} />}
            {index % 2 === 1 && linkify(item)}
          </React.Fragment>
        );
      })}
    </Text>
  );
}
