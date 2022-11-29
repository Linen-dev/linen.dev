import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import Title from './Title';
import Header from './Header';
import { FiRss } from 'react-icons/fi';
import { Nav, Pages } from '@linen/ui';
import { Scope, ThreadState } from '@linen/types';

const { Header: StickyHeader, Filters, Grid } = Pages.Feed;

interface Props {
  fetchFeed(): Promise<any>;
}

export default function Dashboard({ fetchFeed }: Props) {
  const [feed, setFeed] = useState({ threads: [], total: 0 });
  useEffect(() => {
    fetchFeed().then((response) => {
      setFeed(response.data);
    });
  }, []);

  const permissions = {
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
  };
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
            permissions={permissions}
          />
          <Grid
            threads={feed.threads}
            selections={{}}
            permissions={permissions}
            loading={false}
            onChange={() => {}}
            onSelect={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
