import React from 'react';
import styles from './index.module.scss';
import PinIcon from 'components/icons/PinIcon';

interface Props {
  children?: React.ReactNode;
  onClick(): void;
}

export default function PinnedSection({ children, onClick }: Props) {
  return (
    <div className={styles.section} onClick={onClick}>
      <div className={styles.icon}>
        <PinIcon />
      </div>
      {children}
    </div>
  );
}
