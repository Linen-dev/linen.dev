import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function H1({ className, children }: Props) {
  return <h1 className={classNames(styles.h1, className)}>{children}</h1>;
}
