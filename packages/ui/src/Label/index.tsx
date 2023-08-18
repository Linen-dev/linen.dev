import React from 'react';
import classNames from 'classnames';
import { FiInfo } from '@react-icons/all-files/fi/FiInfo';
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

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.hint}>
      <div className={styles.content}>
        <FiInfo />
        {children}
      </div>
    </div>
  );
}

Label.Description = Description;
Label.Hint = Hint;

export default Label;
