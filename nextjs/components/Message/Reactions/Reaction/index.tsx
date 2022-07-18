import React from 'react';
import Emoji from '../../Emoji';
import styles from './index.module.css';
import { SerializedReaction } from 'types/shared';

function normalizeText(text: string) {
  if (text.startsWith(':') && text.endsWith(':')) {
    return text;
  }
  return `:${text}:`;
}

function Reaction({ type, count }: SerializedReaction) {
  return (
    <div className={styles.reaction}>
      <Emoji text={normalizeText(type)} /> {count}
    </div>
  );
}

export default Reaction;
