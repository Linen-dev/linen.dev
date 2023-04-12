import React from 'react';
import styles from './index.module.scss';
import { FiZap } from '@react-icons/all-files/fi/FiZap';

export default function UpgradeButton() {
  return (
    <a className={styles.button} href="/plans">
      <FiZap /> Upgrade
    </a>
  );
}
