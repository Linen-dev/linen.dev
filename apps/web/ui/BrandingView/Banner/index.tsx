import React from 'react';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import UpgradeButton from '@/Header/UpgradeButton';
import styles from './index.module.scss';

interface Props {
  InternalLink: any;
}

export default function ({ InternalLink }: Props) {
  return (
    <div className={styles.banner}>
      <h1 className={styles.header}>
        <span className={styles.underline}>
          <FiZap />
          Upgrade
        </span>
      </h1>
      <p className={styles.description}>
        Choose an affordable plan that matches your community size and unlock
        additional features of the platform.{' '}
        <span className={styles.underline}>7-day free trial.</span>
      </p>
      <UpgradeButton label="Upgrade to Premium" InternalLink={InternalLink} />
    </div>
  );
}
