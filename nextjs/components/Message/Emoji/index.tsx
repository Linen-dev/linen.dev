import React from 'react';
import ReactEmoji from 'react-emoji-render';

interface Props {
  text?: string;
}

export default function Emoji({ text }: Props) {
  if (!text) {
    return null;
  }
  return <ReactEmoji text={text} />;
}
