import React from 'react';
import styles from './Layout.module.css';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Styleguide</h1>
      {children}
    </div>
  );
}
