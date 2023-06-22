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

function Reaction({ type: initialType, count, active }: Props) {
  const alias = (ALIASES as { [key: string]: string })[initialType];
  const type = normalizeText(initialType);

  if (UNSUPPORTED_EMOJIS.includes(type)) {
    return (
      <div className={styles.reaction} title={type}>
        {type} {count}
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
      <Emoji text={type} /> {count}
    </div>
  );
}

export default Reaction;
