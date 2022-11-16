import React from 'react';
import styles from './index.module.scss';
import Title from './Title';
import Header from './Header';

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Title />
      <Header />
    </div>
  );
}
