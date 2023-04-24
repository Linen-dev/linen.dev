import React from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';

interface Props {
  monospaced?: boolean;
  children: React.ReactNode;
}

export default function Table({ monospaced, children }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.wrapper2}>
        <div className={styles.wrapper3}>
          <table
            className={classNames(styles.table, {
              [styles['font-mono']]: monospaced,
            })}
          >
            {children}
          </table>
        </div>
      </div>
    </div>
  );
}
