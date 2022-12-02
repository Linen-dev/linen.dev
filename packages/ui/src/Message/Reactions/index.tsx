import React from 'react';
import Reaction from './Reaction';
import styles from './index.module.scss';
import { SerializedReaction, SerializedUser } from '@linen/types';

interface Props {
  reactions?: SerializedReaction[];
  currentUser?: SerializedUser | null;
}

function Reactions({ reactions, currentUser }: Props) {
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
          active={
            !!currentUser &&
            !!reaction.users.find((user) => user.id === currentUser.id)
          }
        />
      ))}
    </div>
  );
}

export default Reactions;
