import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FiZap } from '@react-icons/all-files/fi/FiZap';

export default function UpgradeButton({
  className,
  InternalLink,
  label,
}: {
  className?: string;
  InternalLink: (args: any) => JSX.Element;
  label?: string;
}) {
  return (
    <InternalLink
      className={classNames(styles.button, className)}
      href="/plans"
    >
      <FiZap /> {label || 'Upgrade'}
    </InternalLink>
  );
}
