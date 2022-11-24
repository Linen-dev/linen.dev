import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function ButtonGroup({ className, children }: Props) {
  return <div className={classNames(styles.group, className)}>{children}</div>;
}
