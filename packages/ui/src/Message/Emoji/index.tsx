import React from 'react';
import { toArray } from 'react-emoji-render';

interface Props {
  text?: string;
}

export default function Emoji({ text }: Props) {
  if (!text) {
    return null;
  }
  return (
    <>
      {toArray(text).reduce((previous, current: any) => {
        if (typeof current === 'string') {
          return previous + current;
        }
        return previous + current.props.children;
      }, '')}
    </>
  );
}
