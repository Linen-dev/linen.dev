import React from 'react';
import { FiMenu } from '@react-icons/all-files/fi/FiMenu';
import styles from './index.module.scss';

interface Props {
  onClick(): void;
}

export default function MenuIcon({ onClick }: Props) {
  return (
    <div className={styles.icon} onClick={onClick}>
      <FiMenu />
    </div>
  );
}
