import React from 'react';
import data from '@emoji-mart/data';
import ALIASES from './utilities/aliases';

interface Props {
  text?: string;
}

export default function Emoji({ text }: Props) {
  if (!text) {
    return null;
  }
  if (text.startsWith(':') && text.endsWith(':')) {
    const name = text.slice(1, text.length - 1);
    const alias = (ALIASES as { [key: string]: string })[name];
    if (alias) {
      return <>{alias}</>;
    }
    const { aliases, emojis }: any = data;
    if (name.includes('::')) {
      const [id, tone] = name.split('::');
      if (tone.startsWith('skin-tone-')) {
        const index = Number(tone[tone.length - 1]);
        const emoji = emojis[id]?.skins[index]?.native;
        if (emoji) {
          return emoji;
        }
      }
    }
    const id = aliases[name] || name;
    const emoji = emojis[id]?.skins[0]?.native;
    return <>{emoji || text}</>;
  }
  return <>{text}</>;
}
