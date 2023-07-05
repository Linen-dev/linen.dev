import React, { useState } from 'react';
import BlankLayout from '@linen/ui/BlankLayout';
import CommunityCard from '@linen/ui/CommunityCard';
import styles from './index.module.scss';
import Row from '@linen/ui/Row';
import { GetServerSidePropsContext } from 'next';
import {
  Permissions,
  SerializedAccount,
  SerializedThread,
  Settings,
} from '@linen/types';
import LinenLogo from '@linen/ui/LinenLogo';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import FeedService from 'services/feed';
import PermissionsService from 'services/permissions';

interface Props {
  permissions: Permissions;
  threads: SerializedThread[];
  settings: Settings[];
  communities: SerializedAccount[];
}

const TAKE = 12;

export default function Feed({
  permissions,
  threads: initialThreads,
  settings: initialSettings,
  communities: initialCommunities,
}: Props) {
  const [skip, setSkip] = useState(TAKE);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(true);
  const [threads, setThreads] = useState<SerializedThread[]>(initialThreads);
  const [settings, setSettings] = useState<Settings[]>(initialSettings);
  const [communities, setCommunities] =
    useState<SerializedAccount[]>(initialCommunities);

  async function onLoadMore() {
    setLoading(true);
    fetch(`/api/feed?skip=${skip}&take=${TAKE}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then(
        ({
          threads: newThreads,
          settings: newSettings,
          communities: newCommunities,
        }: {
          threads: SerializedThread[];
          settings: Settings[];
          communities: SerializedAccount[];
        }) => {
          setLoading(false);
          setSkip((skip) => skip + TAKE);
          setMore(newThreads.length > 0);
          setThreads((threads) => [...threads, ...newThreads]);
          setSettings((settings) => {
            const ids = settings.map((setting) => setting.communityId);
            const settingsToAdd = newSettings.filter(
              (setting) => !ids.includes(setting.communityId)
            );
            return [...settings, ...settingsToAdd];
          });
          setCommunities((communities) => {
            const ids = communities.map((community) => community.id);
            const communitiesToAdd = newCommunities.filter(
              (community) => !ids.includes(community.id)
            );
            return [...communities, ...communitiesToAdd];
          });
        }
      );
  }

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage: more,
    onLoadMore,
    disabled: loading,
    rootMargin: '0px 0px 320px 0px',
    delayInMs: 0,
  });
  return (
    <BlankLayout>
      <div className={styles.grid}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <LinenLogo /> <small>Feed</small>
          </div>
        </div>
        <main className={styles.center}>
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
        <div className={styles.right}>
          {communities.map((community) => {
            return (
              <CommunityCard
                key={community.id}
                className={styles.card}
                community={community}
              />
            );
          })}
        </div>
      </div>
    </BlankLayout>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const [permissions, { threads, settings, communities }] = await Promise.all([
    PermissionsService.for(context),
    FeedService.get({ skip: 0, take: TAKE }),
  ]);

  return {
    props: {
      permissions,
      threads,
      settings,
      communities,
    },
  };
};
