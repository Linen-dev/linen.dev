import React from 'react';
import ReactEmoji from 'react-emoji-render';

interface Props {
  value: string;
}

export default function Text({ value }: Props) {
  return <ReactEmoji text={value} />;
}
