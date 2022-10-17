import React from 'react';
import Reaction from './Reaction';
import styles from './index.module.css';
import { SerializedReaction } from 'serializers/reaction';

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
          users={reaction.users}
        />
      ))}
    </div>
  );
}

export default Reactions;
