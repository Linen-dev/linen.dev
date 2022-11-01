import React from 'react';
import { FiAnchor } from 'react-icons/fi';
import styles from './index.module.scss';

export default function DragImage() {
  return (
    <div className={styles.image}>
      <FiAnchor />
      Move
    </div>
  );
}
