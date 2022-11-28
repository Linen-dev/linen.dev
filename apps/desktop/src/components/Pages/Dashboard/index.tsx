import React from 'react';
import styles from './index.module.scss';
import Title from './Title';
import Header from './Header';
import { FiRss } from 'react-icons/fi';
import { Nav, Pages } from '@linen/ui';
import { Scope, ThreadState } from '@linen/types';

const { Header: StickyHeader, Filters } = Pages.Feed;

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
          <Filters
            state={ThreadState.OPEN}
            selections={{}}
            defaultScope={Scope.All}
            page={1}
            total={100}
            onChange={() => {}}
            onUpdate={() => {}}
            onPageChange={() => {}}
            isFetchingTotal={false}
            permissions={{
              access: false,
              feed: false,
              chat: false,
              manage: false,
              is_member: false,
              channel_create: false,
              accountId: null,
              token: null,
              user: null,
              auth: null,
            }}
          />
        </div>
      </div>
    </div>
  );
}
