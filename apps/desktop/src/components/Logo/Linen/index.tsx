import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import LinenIcon from '../../Icon/Linen';

interface Props {
  className?: string;
}

export default function LinenLogo({ className }: Props) {
  return (
    <div className={classNames(styles.container, className)}>
      <LinenIcon />
      <div className={styles.text}>Linen</div>
    </div>
  );
}
