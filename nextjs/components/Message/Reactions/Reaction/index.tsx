import React from 'react';
import ALIASES from '../../Emoji/utilities/aliases';
import styles from './index.module.css';
import { SerializedReaction } from 'types/shared';

function normalizeType(type: string) {
  if (type.startsWith(':') && type.endsWith(':')) {
    return type.slice(1, -1);
  }
  return type;
}

function Reaction({ type, count }: SerializedReaction) {
  const alias = (ALIASES as { [key: string]: string })[normalizeType(type)];
  if (alias) {
    return (
      <a className={styles.reaction} title={type}>
        {alias} {count}
      </a>
    );
  }
  return (
    <a className={styles.reaction} title={type}>
      {type} {count}
    </a>
  );
}

export default Reaction;
