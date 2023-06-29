import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  size?: 'md' | 'lg';
  children: React.ReactNode;
}

function Card({ className, size, children }: Props) {
  return (
    <div
      className={classNames(styles.card, className, {
        [styles.lg]: size === 'lg',
      })}
    >
      {children}
    </div>
  );
}

export default Card;
