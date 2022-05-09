import React from 'react';
import ReactEmoji from 'react-emoji-render';
import { decodeHTML } from '../utilities/string';

interface Props {
  value: string;
}

export default function Text({ value }: Props) {
  const text = decodeHTML(value);
  return <ReactEmoji text={text} />;
}
