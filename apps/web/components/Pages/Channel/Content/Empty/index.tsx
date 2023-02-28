import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FiMessageSquare } from '@react-icons/all-files/fi/FiMessageSquare';

export default function Empty() {
  return (
    <div className={classNames(styles.container, styles.stripe)}>
      <div className={styles.icon}>
        <FiMessageSquare />
      </div>
      <h2 className={styles.header}>Nothing is here.</h2>
    </div>
  );
}
