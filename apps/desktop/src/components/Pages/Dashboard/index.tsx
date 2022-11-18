import React from 'react';
import styles from './index.module.scss';
import Title from './Title';
import Header from './Header';
import { FiRss } from 'react-icons/fi';
import { Nav, Pages } from '@linen/ui';

const { Header: StickyHeader } = Pages.Feed;

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Title />
      <Header />
      <div className={styles.main}>
        <Nav className={styles.nav}>
          <Nav.Item active>
            <FiRss /> Feed
          </Nav.Item>
        </Nav>
        <div className={styles.content}>
          <StickyHeader />
        </div>
      </div>
    </div>
  );
}
