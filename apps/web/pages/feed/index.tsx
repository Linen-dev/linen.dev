import React, { useEffect, useState, useCallback } from 'react';
import BlankLayout from '@linen/ui/BlankLayout';
import styles from './index.module.scss';
import Row from '@linen/ui/Row';
import { SerializedAccount, SerializedThread, Settings } from '@linen/types';
import LinenLogo from '@linen/ui/LinenLogo';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Nav from '@linen/ui/Nav';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { getHomeUrl } from '@linen/utilities/home';
import { getThreadUrl } from '@linen/utilities/url';

const TAKE = 12;

export default function Feed() {
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [threads, setThreads] = useState<SerializedThread[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  const [communities, setCommunities] = useState<SerializedAccount[]>([]);

  async function fetchFeed() {
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
          setMore(newThreads.length > 0);
        }
      );
  }

  useEffect(() => {
    fetchFeed();
  }, []);

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage: more,
    onLoadMore: fetchFeed,
    disabled: loading || !more || threads.length % TAKE !== 0,
    rootMargin: '0px 0px 640px 0px',
    delayInMs: 0,
  });
  return (
    <BlankLayout className={styles.layout}>
      <div className={styles.grid}>
        <div className={styles.left}>
          <div className={styles.sticky}>
            <div className={styles.logo}>
              <LinenLogo /> <small>Feed</small>
            </div>
            <Nav>
              <Nav.Group>Communities</Nav.Group>
              {communities.slice(0, 20).map((community) => {
                return (
                  <a
                    href={getHomeUrl(community)}
                    key={community.id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Nav.Item>
                      <FiHash />
                      {community.name}
                    </Nav.Item>
                  </a>
                );
              })}
            </Nav>
          </div>
        </div>
        <main className={styles.center}>
          <div className={styles.logo}>
            <LinenLogo /> <small>Feed</small>
          </div>
          {threads.map((thread) => {
            const community = communities.find(
              (community) => community.id === thread.channel?.accountId
            ) as SerializedAccount;
            const setting = settings.find(
              (setting) => setting.communityId === thread.channel?.accountId
            ) as Settings;
            const url = getThreadUrl({
              isSubDomainRouting: false,
              settings: setting,
              incrementId: thread.incrementId,
              slug: thread.slug,
              LINEN_URL: process.env.DEVELOPMENT
                ? 'http://localhost:3000'
                : 'https://www.linen.dev',
            });
            return (
              <a href={url} target="_blank" key={thread.id} rel="noreferrer">
                <Row
                  className={styles.row}
                  thread={thread}
                  currentUser={null}
                  isSubDomainRouting={false}
                  settings={setting}
                  showActions={false}
                  subheader={
                    <a
                      href={getHomeUrl(community)}
                      key={community.id}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.subheader}
                    >
                      <FiHash />
                      {community.name}
                    </a>
                  }
                />
              </a>
            );
          })}
          <div ref={sentryRef} />
        </main>
        <div className={styles.right}>
          <div className={styles.sticky}>
            <h1>What is Linen?</h1>
            <p>
              <small>
                Linen is a real-time chat platform built for communities. We are
                SEO friendly while providing a modern chat experience.
              </small>
            </p>
            <h2>Forum and a real-time chat</h2>
            <p>
              <small>
                Information gets lost in real-time chat. Linen solves this by
                letting Google find your content. Our advanced threading model
                let you drag and drop messages and threads to reorganize your
                content.
              </small>
            </p>
            <a href="https://linen.dev" target="_blank" rel="noreferrer">
              Read more
            </a>
          </div>
        </div>
      </div>
    </BlankLayout>
  );
}
