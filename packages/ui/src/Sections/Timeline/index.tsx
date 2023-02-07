import React from 'react'
import styles from './index.module.scss';

interface Props {
  id?: string;
}

export default function Timeline ({ id }: Props) {
  return <div id={id} className={styles.section}>
    <div className={styles.left}>
      <h2>Past</h2>
      <h3>Import</h3>
      <h3>Sync</h3>
    </div>
    <div className={styles.center}>
      <h2>Present</h2>
      <h3>Chat</h3>
      <h3>Discuss</h3>
    </div>
    <div className={styles.right}>
      <h2>Future</h2>
      <h3>Blog</h3>
      <h3>Docs</h3>
    </div>
  </div>
}