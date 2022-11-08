import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function H2({ className, children }: Props) {
  return <h1 className={classNames(styles.h2, className)}>{children}</h1>;
}
