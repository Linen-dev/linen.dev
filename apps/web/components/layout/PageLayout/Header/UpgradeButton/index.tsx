import React from 'react';
import styles from './index.module.scss';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import Link from 'components/Link/InternalLink';

export default function UpgradeButton() {
  return (
    <Link className={styles.button} href="/plans">
      <FiZap /> Upgrade
    </Link>
  );
}
