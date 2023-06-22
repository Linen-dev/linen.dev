import React from 'react';
import classNames from 'classnames';
import Emoji from '../../Emoji';
import styles from './index.module.scss';

function wrap(text: string) {
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
  const type = wrap(initialType);

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
