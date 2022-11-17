import React from 'react';
import styles from './index.module.scss';
import Title from './Title';
import Header from './Header';
import { Nav } from '@linen/ui';

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Title />
      <Header />
      <Nav>
        <Nav.Item>Feed</Nav.Item>
      </Nav>
    </div>
  );
}
