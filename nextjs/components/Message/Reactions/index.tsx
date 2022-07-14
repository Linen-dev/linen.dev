import React from 'react';
import Reaction from './Reaction';
import styles from './index.module.css';
import { SerializedReaction } from 'types/shared';

interface Props {
  reactions?: SerializedReaction[];
}

function Reactions({ reactions }: Props) {
  if (!reactions || reactions.length === 0) {
    return null;
  }
  return (
    <div className={styles.reactions}>
      {reactions.map((reaction, index) => (
        <Reaction
          key={reaction.type + index}
          type={reaction.type}
          count={reaction.count}
        />
      ))}
    </div>
  );
}

export default Reactions;
