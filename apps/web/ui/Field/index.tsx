import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}

function Field({ className, children }: Props) {
  return <div className={classNames(styles.field, className)}>{children}</div>;
}

export default Field;
