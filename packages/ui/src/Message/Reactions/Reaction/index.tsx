import React from 'react';
import classNames from 'classnames';
import Emoji from '../../Emoji';
import ALIASES from '../../Emoji/utilities/aliases';
import { UNSUPPORTED_EMOJIS } from '../../Emoji/utilities/emojis';
import styles from './index.module.scss';

function normalizeText(text: string) {
  if (text.startsWith(':') && text.endsWith(':')) {
    return text;
  }
  return `:${text}:`;
}

interface Props {
  type: string;
  count: number;
  active?: boolean;
}

function Reaction({ type, count, active }: Props) {
  const alias = (ALIASES as { [key: string]: string })[type];

  if (UNSUPPORTED_EMOJIS.includes(type)) {
    return (
      <div className={styles.reaction} title={type}>
        {normalizeText(type)} {count}
      </div>
    );
  }
  if (alias) {
    return (
      <div className={styles.reaction} title={type}>
        {alias} {count}
      </div>
    );
  }
  return (
    <div
      className={classNames(styles.reaction, { [styles.active]: active })}
      title={type}
    >
      <Emoji text={normalizeText(type)} /> {count}
    </div>
  );
}

export default Reaction;
