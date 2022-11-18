import React from 'react';
import styles from './index.module.scss';
import Title from './Title';
import Header from './Header';
import { FiRss } from 'react-icons/fi';
import { Nav, StickyHeader } from '@linen/ui';

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
          <StickyHeader>
            <StickyHeader.Title>
              <FiRss /> Feed
            </StickyHeader.Title>
            <StickyHeader.Subtitle>
              All of your channel conversations in one place
            </StickyHeader.Subtitle>
          </StickyHeader>
        </div>
      </div>
    </div>
  );
}
