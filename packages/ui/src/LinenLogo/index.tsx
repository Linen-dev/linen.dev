import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
}

export default function LinenLogo({ className }: Props) {
  return <div className={classNames(styles.logo, className)}></div>;
}
