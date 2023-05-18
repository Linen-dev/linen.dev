import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  size?: 'md' | 'lg';
  children: React.ReactNode;
}

function Card({ size, children }: Props) {
  return (
    <div className={classNames(styles.card, { [styles.lg]: size === 'lg' })}>
      {children}
    </div>
  );
}

export default Card;
