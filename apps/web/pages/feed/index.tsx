import React, { useState, useCallback } from 'react';
import BlankLayout from '@linen/ui/BlankLayout';
import styles from './index.module.scss';
import Row from '@linen/ui/Row';
import { GetServerSidePropsContext } from 'next';
import { prisma } from '@linen/database';
import { Permissions, SerializedThread, Settings } from '@linen/types';
import PermissionsService from 'services/permissions';
import { serializeThread } from '@linen/serializers/thread';
import { serializeSettings } from '@linen/serializers/settings';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import LinenLogo from '@linen/ui/LinenLogo';
import useInfiniteScroll from 'react-infinite-scroll-hook';

interface Props {
  permissions: Permissions;
  threads: SerializedThread[];
  settings: Settings[];
}

export default function Feed({
  permissions,
  threads: initialThreads,
  settings,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState<SerializedThread[]>(initialThreads);
  function onLoadMore() {
    setLoading(true);
    setTimeout(() => {
      setThreads((threads) => [...threads, ...threads.slice(0, 10)]);
      setLoading(false);
    }, 200);
  }

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage: true,
    onLoadMore,
    disabled: loading,
    rootMargin: '0px 0px 960px 0px',
    delayInMs: 100,
  });
  return (
    <BlankLayout>
      <div className={styles.background}>
        <LinenLogo className={styles.logo} />
        <main className={styles.main}>
          <header className={styles.header}>
            <FiHash /> Trending
          </header>
          {threads.map((thread) => {
            const setting = settings.find(
              (setting) => setting.communityId === thread.channel?.accountId
            ) as Settings;
            return (
              <Row
                thread={thread}
                permissions={permissions}
                currentUser={null}
                isSubDomainRouting={false}
                settings={setting}
              />
            );
          })}
          <div ref={sentryRef} />
        </main>
      </div>
    </BlankLayout>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const permissions = await PermissionsService.for(context);
  const threads = await prisma.threads.findMany({
    where: {
      channel: {
        account: {
          type: 'PUBLIC',
        },
      },
    },
    include: {
      messages: {
        include: {
          author: true,
          mentions: {
            include: {
              users: true,
            },
          },
          reactions: true,
          attachments: true,
        },
        orderBy: { sentAt: 'asc' },
      },
      channel: true,
    },
    orderBy: { lastReplyAt: 'desc' },
    take: 10,
  });

  const accounts = await prisma.accounts.findMany({
    where: {
      id: { in: threads.map((thread) => thread.channel.accountId) as string[] },
    },
  });

  return {
    props: {
      permissions,
      threads: threads.map(serializeThread),
      settings: accounts.map(serializeSettings),
    },
  };
};
