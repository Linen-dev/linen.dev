import React, { useState, useEffect, useRef } from 'react';
import PageLayout from 'components/layout/PageLayout';
import { channels, ThreadState } from '@prisma/client';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import { Settings } from 'serializers/account/settings';
import { Permissions } from 'types/shared';
import Header from './Header';
import Filters from './Filters';
import Grid from './Grid';
import debounce from 'awesome-debounce-promise';
import { FeedResponse, Selections } from './types';
import styles from './index.module.css';
import { Thread } from 'components/Thread';
import { scrollToBottom } from 'utilities/scroll';
import { Transition } from '@headlessui/react';

interface Props {
  channels: channels[];
  communityName: string;
  currentUser: SerializedUser;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

const debouncedFetch = debounce(
  ({ communityName, state, page }) => {
    return fetch(
      `/api/feed?communityName=${communityName}&state=${state}&page=${page}`,
      {
        method: 'GET',
      }
    ).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to fetch the feed.');
    });
  },
  250,
  { leading: true }
);

const POLL_INTERVAL_IN_SECONDS = 30;
const POLL_INTERVAL = POLL_INTERVAL_IN_SECONDS * 1000;

export default function Feed({
  channels,
  communityName,
  currentUser,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  const [feed, setFeed] = useState<FeedResponse>({ threads: [], total: 0 });
  const [state, setState] = useState<ThreadState>(ThreadState.OPEN);
  const [page, setPage] = useState<number>(1);
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState<Selections>({});
  const [thread, setThread] = useState<SerializedThread | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const updateThreads = async () => {
    const ids: string[] = [];
    for (const key in selections) {
      const selection = selections[key];
      if (selection) {
        ids.push(key);
      }
    }
    const newState =
      state === ThreadState.OPEN ? ThreadState.CLOSE : ThreadState.OPEN;
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/threads/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            state: newState,
          }),
        })
      )
    );
    setThread((thread) => {
      if (!thread) {
        return null;
      }
      if (ids.includes(thread.id)) {
        return {
          ...thread,
          state: newState,
        };
      }
      return thread;
    });

    setSelections({});
    setKey((key) => key + 1);
  };

  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const fetchFeed = () =>
      debouncedFetch({ communityName, state, page })
        .then((data: FeedResponse) => {
          if (mounted) {
            setFeed(data);
          }
        })
        .catch(() => {
          if (mounted) {
            alert('Something went wrong. Please reload the page.');
          }
        })
        .finally(() => {
          if (mounted) {
            setLoading(false);
          }
        });
    fetchFeed();

    const intervalId = setInterval(() => {
      fetchFeed();
    }, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      mounted = false;
    };
  }, [communityName, state, page, key]);

  return (
    <PageLayout
      channels={channels}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
      className="w-full block"
    >
      <div
        className="
          overflow-auto
          lg:h-[calc(100vh_-_64px)]
          md:h-[calc(100vh_-_144px)] 
          h-[calc(100vh_-_152px)]
          lg:w-[calc(100vw_-_250px)]
          flex justify-left
          w-[100vw]
          relative      
        "
      >
        <Transition
          show={isMobile && !!thread ? false : true}
          className={styles.feed}
        >
          <Header />
          <Filters
            state={state}
            selections={selections}
            onChange={(type: string, value) => {
              setSelections({});
              setPage(1);
              switch (type) {
                case 'state':
                  setState(value as ThreadState);
              }
            }}
            total={feed.total}
            onUpdate={updateThreads}
            page={page}
            onPageChange={(type: string) => {
              switch (type) {
                case 'back':
                  return setPage((page) => page - 1);
                case 'next':
                  return setPage((page) => page + 1);
              }
            }}
          />
          <Grid
            threads={feed.threads}
            loading={loading}
            selections={selections}
            onChange={(id: string, checked: boolean) => {
              setSelections((selections: Selections) => {
                return {
                  ...selections,
                  [id]: checked,
                };
              });
            }}
            onSelect={(thread: SerializedThread) => {
              setThread(thread);
            }}
          />
        </Transition>
        <Transition show={!!thread} className={styles.thread}>
          {thread && (
            <div className="overflow-auto flex flex-col relative" ref={ref}>
              <Thread
                key={thread.id}
                id={thread.id}
                channelId={thread.channelId}
                channelName={thread.channel?.channelName || 'xx'}
                title={thread.title}
                state={thread.state}
                messages={thread.messages}
                threadUrl={'foobarbaz'}
                viewCount={thread.viewCount}
                settings={settings}
                incrementId={thread.incrementId}
                isSubDomainRouting={isSubDomainRouting}
                slug={thread.slug}
                permissions={permissions}
                currentUser={currentUser}
                onThreadUpdate={({ state, title }) => {
                  setThread((thread) => {
                    if (!thread) {
                      return null;
                    }
                    return {
                      ...thread,
                      state,
                      title,
                    };
                  });
                  setKey((key) => key + 1);
                }}
                onClose={() => setThread(null)}
                onSend={() => {
                  scrollToBottom(ref.current as HTMLElement);
                }}
                onMount={() => {
                  permissions.chat &&
                    scrollToBottom(ref.current as HTMLElement);
                }}
              />
            </div>
          )}
        </Transition>
      </div>
    </PageLayout>
  );
}
