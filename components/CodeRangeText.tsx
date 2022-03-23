import { Code } from '@mantine/core';
import React from 'react';
import Emoji from 'react-emoji-render';

const codeify = (item: string) => {
  const [_, inner] = item.match(/<code>(.*?)<\/code>/) || [];
  return <Code>{inner}</Code>;
};

export default function LinkRangeText({ text }: { text: string }) {
  const textArray = text.split(/(<code>.*?\/code>)/);
  if (textArray.length < 3) {
    return (
      <p className="break-words text-sm">
        <Emoji text={text} />
      </p>
    );
  }

  return (
    <p className="break-words text-sm">
      {textArray.map((item, index) => {
        return (
          <React.Fragment key={index}>
            {index % 2 === 0 && item}
            {index % 2 === 1 && codeify(item)}
          </React.Fragment>
        );
      })}
    </p>
  );
}
