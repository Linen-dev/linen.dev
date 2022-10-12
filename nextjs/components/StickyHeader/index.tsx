import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function Header({ children }: Props) {
  return (
    <div
      className={classNames(
        styles.header,
        'border-b border-solid border-gray-200 py-4 px-4'
      )}
    >
      {children}
    </div>
  );
}
