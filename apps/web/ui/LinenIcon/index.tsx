import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
}

export default function LinenIcon({ className }: Props) {
  return (
    <div className={classNames(styles.logo, className)}>
      <div
        className={classNames(
          styles['line-vertical'],
          styles['line-vertical-one']
        )}
      ></div>
      <div
        className={classNames(
          styles['line-vertical'],
          styles['line-vertical-two']
        )}
      ></div>
      <div
        className={classNames(
          styles['line-vertical'],
          styles['line-vertical-three']
        )}
      ></div>
      <div
        className={classNames(
          styles['line-horizontal'],
          styles['line-horizontal-one']
        )}
      >
        <div className={styles.square}></div>
      </div>
      <div
        className={classNames(
          styles['line-horizontal'],
          styles['line-horizontal-two']
        )}
      >
        <div className={styles.square}></div>
      </div>
      <div
        className={classNames(
          styles['line-horizontal'],
          styles['line-horizontal-three']
        )}
      >
        <div className={styles.square}></div>
      </div>
    </div>
  );
}
