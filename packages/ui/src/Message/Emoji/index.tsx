import React from 'react';
// @ts-ignore
import EMOJIS from './utilities/emojis.json';
interface Props {
  text?: string;
}

function unwrap(text: string): string {
  if (text.startsWith(':') && text.endsWith(':')) {
    return text.slice(1, text.length - 1);
  }
  return text;
}

export default function Emoji({ text }: Props) {
  if (!text) {
    return null;
  }
  const name = unwrap(text);
  return <>{EMOJIS[name] || text}</>;
}
