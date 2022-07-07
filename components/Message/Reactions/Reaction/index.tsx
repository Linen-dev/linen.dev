import React from 'react';
import ReactEmoji from 'react-emoji-render';
import styles from './index.module.css';
import { Reaction as ReactionType } from '../../types';

function Reaction({ type, count }: ReactionType) {
  return (
    <div className={styles.reaction}>
      <ReactEmoji text={type} /> {count}
    </div>
  );
}

export default Reaction;
