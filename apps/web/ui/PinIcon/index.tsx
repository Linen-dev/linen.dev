import React from 'react';
import { GoPin } from '@react-icons/all-files/go/GoPin';
import styles from './index.module.scss';

export default function PinIcon() {
  return (
    <div className={styles.pin}>
      <GoPin />
    </div>
  );
}
