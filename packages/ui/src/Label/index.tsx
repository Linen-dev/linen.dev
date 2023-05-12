import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  htmlFor: string;
  children: React.ReactNode;
}

function Label({ className, htmlFor, children }: Props) {
  return (
    <label className={classNames(styles.label, className)} htmlFor={htmlFor}>
      {children}
    </label>
  );
}

function Description({ children }: { children: React.ReactNode }) {
  return <div className={styles.description}>{children}</div>;
}

Label.Description = Description;

export default Label;
