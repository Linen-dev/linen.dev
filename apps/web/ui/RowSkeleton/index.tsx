import React from 'react';
import { Facebook } from 'react-content-loader';
import styles from './index.module.scss';

export default function RowSkeleton() {
  return (
    <div className={styles.skeleton}>
      <Facebook
        backgroundColor="var(--color-gray-100)"
        foregroundColor="var(--color-gray-200)"
      />
    </div>
  );
}
