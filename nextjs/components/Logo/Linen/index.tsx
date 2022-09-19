import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

export default function LinenLogo() {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
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
      <div className={styles.text}>Linen</div>
    </div>
  );
}
