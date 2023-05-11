import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FiStar } from '@react-icons/all-files/fi/FiStar';

interface Props {
  loading: boolean;
}

export default function Empty({ loading }: Props) {
  if (loading) {
    return <div className={styles.container}></div>;
  }
  return (
    <div className={classNames(styles.container, styles.stripe)}>
      <div className={styles.icon}>
        <FiStar />
      </div>
      <h2 className={styles.header}>Nothing is here.</h2>
    </div>
  );
}
