import React from 'react';
import styles from './index.module.css';

export default function DragImage() {
  return (
    <img
      className={styles.image}
      id="drag-and-drop-placeholder-image"
      src="/images/circle.svg"
      height="32"
    />
  );
}
