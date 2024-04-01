import classNames from 'classnames';
// @ts-ignore
import EMOJIS from './utilities/emojis.json';
import { getColor } from '@linen/utilities/colors';
import { getLetter } from '@linen/utilities/string';
import styles from './index.module.scss';

interface Props {
  text?: string;
}

// our production build process incorrectly optimizes the following key from emojis.json
// { "+1": "👍" }
// the code above is converted to:
// { 1: "👍" }
// the issue does most likely come from next.js minification located here
// https://github.com/vercel/next.js/blob/df08b22e7ff783523ef8fc27913d6480e66f2db0/packages/next/src/build/webpack/plugins/terser-webpack-plugin/src/minify.ts#L4
// I haven't been able to reproduce this error with terser directly though.
// Setting up next.js locally for development is too time consuming.
// To make this issue even more interesting, server side rendering works fine
EMOJIS['+1'] = '👍';

function unwrap(text: string): string {
  if (text.startsWith(':') && text.endsWith(':')) {
    return text.slice(1, text.length - 1);
  }
  return text;
}

function title(text: string) {
  return text.replace(/_/g, ' ').replace(/-/g, ' ');
}

export default function Emoji({ text }: Props) {
  if (!text) {
    return null;
  }
  const name = unwrap(text);
  // @ts-ignore
  if (EMOJIS[name]) {
    // @ts-ignore
    return <>{EMOJIS[name]}</>;
  }
  const letter = getLetter(name);
  const color = getColor(letter);
  return (
    <span
      className={classNames(styles.unknown, {
        [styles[`color-${color}`]]: color,
      })}
    >
      {title(name)}
    </span>
  );
}
