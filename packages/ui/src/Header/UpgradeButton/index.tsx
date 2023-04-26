import React from 'react';
import styles from './index.module.scss';
import { FiZap } from '@react-icons/all-files/fi/FiZap';

export default function UpgradeButton({
  InternalLink,
}: {
  InternalLink: (args: any) => JSX.Element;
}) {
  return (
    <InternalLink className={styles.button} href="/plans">
      <FiZap /> Upgrade
    </InternalLink>
  );
}
