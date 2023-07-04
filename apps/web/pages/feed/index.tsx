import React, { useState } from 'react';
import BlankLayout from '@linen/ui/BlankLayout';
import styles from './index.module.scss';
import Row from '@linen/ui/Row';
import { GetServerSidePropsContext } from 'next';
import { Permissions, SerializedThread, Settings } from '@linen/types';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import LinenLogo from '@linen/ui/LinenLogo';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import FeedService from 'services/feed';
import PermissionsService from 'services/permissions';

interface Props {
  permissions: Permissions;
  threads: SerializedThread[];
  settings: Settings[];
}

export default function Feed({
  permissions,
  threads: initialThreads,
  settings: initialSettings,
}: Props) {
  const [skip, setSkip] = useState(10);
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState<SerializedThread[]>(initialThreads);
  const [settings, setSettings] = useState<Settings[]>(initialSettings);
  function onLoadMore() {
    setLoading(true);
    setTimeout(async () => {
      await fetch(`/api/feed?skip=${skip}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => response.json())
        .then(
          ({
            threads: newThreads,
            settings: newSettings,
          }: {
            threads: SerializedThread[];
            settings: Settings[];
          }) => {
            setThreads((threads) => [...threads, ...newThreads]);
            setSettings((settings) => {
              const settingsIds = settings.map(
                (setting) => setting.communityId
              );
              const settingsToAdd = newSettings.filter(
                (setting) => !settingsIds.includes(setting.communityId)
              );
              return [...settings, ...settingsToAdd];
            });
          }
        );
      setSkip((skip) => skip + 10);
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
            <FiHash /> Feed
          </header>
          {threads.map((thread) => {
            const setting = settings.find(
              (setting) => setting.communityId === thread.channel?.accountId
            ) as Settings;
            return (
              <Row
                key={thread.id}
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
  const [permissions, { threads, settings }] = await Promise.all([
    PermissionsService.for(context),
    FeedService.get({ skip: 0 }),
  ]);

  return {
    props: {
      permissions,
      threads,
      settings,
    },
  };
};
