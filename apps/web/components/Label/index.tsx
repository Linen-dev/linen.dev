import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props {
  className?: string;
  htmlFor: string;
  children: React.ReactNode;
}

export default function Label({ className, htmlFor, children }: Props) {
  return (
    <label className={classNames(styles.label, className)} htmlFor={htmlFor}>
      {children}
    </label>
  );
}
