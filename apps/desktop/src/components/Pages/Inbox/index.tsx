import React from 'react';
import styles from './index.module.scss';
import Title from './Title';
import Header from './Header';
import Content from './Content';
import { FiInbox } from 'react-icons/fi';
import { Nav } from '@linen/ui';
import { CommunityType } from '@linen/types';

interface Props {
  fetchInbox(): Promise<any>;
  fetchThread(): Promise<any>;
  putThread(): Promise<any>;
}

export default function Dashboard({
  fetchInbox,
  fetchThread,
  putThread,
}: Props) {
  const permissions = {
    access: false,
    inbox: false,
    chat: false,
    manage: false,
    is_member: false,
    channel_create: false,
    accountId: null,
    token: null,
    user: null,
    auth: null,
  };
  const settings = {
    communityId: '1234',
    communityType: CommunityType.linen,
    communityName: 'linen',
    name: 'linen',
    brandColor: '#000000',
    homeUrl: 'https://linen.dev',
    docsUrl: 'https://linen.dev/docs',
    logoUrl: 'https://linen.dev/logo.png',
    communityUrl: null,
    communityInviteUrl: null,
  };
  return (
    <div className={styles.container}>
      <Title />
      <Header />
      <div className={styles.main}>
        <Nav className={styles.nav}>
          <Nav.Item active>
            <FiInbox /> Inbox
          </Nav.Item>
        </Nav>
        <Content
          fetchInbox={fetchInbox}
          fetchThread={fetchThread}
          putThread={putThread}
          isSubDomainRouting={false}
          permissions={permissions}
          settings={settings}
        />
      </div>
    </div>
  );
}
