import React from 'react';
import ReactEmoji from 'react-emoji-render';
import styles from './index.module.css';
import { SerializedReaction } from 'types/shared';

function Reaction({ type, count }: SerializedReaction) {
  return (
    <div className={styles.reaction}>
      <ReactEmoji text={type} /> {count}
    </div>
  );
}

export default Reaction;
