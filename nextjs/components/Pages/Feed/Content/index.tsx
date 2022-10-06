import React, { useState, useRef, useCallback } from 'react';
import SidebarLayout from 'components/layout/shared/SidebarLayout';
import { ThreadState } from '@prisma/client';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import { Settings } from 'serializers/account/settings';
import { Permissions, Scope } from 'types/shared';
import Header from '../Header';
import Filters from '../Filters';
import Grid from '../Grid';
import { FeedResponse, Selections } from '../types';
import { Thread } from 'components/Thread';
import { scrollToBottom } from 'utilities/scroll';
import debounce from 'utilities/debounce';
import { SerializedMessage } from 'serializers/message';
import { v4 as uuid } from 'uuid';
import usePolling from 'hooks/polling';
import useThreadWebsockets from 'hooks/websockets/thread';
import { useUsersContext } from 'contexts/Users';
import { MessageFormat, Roles } from '@prisma/client';
import useFeedWebsockets from 'hooks/websockets/feed';
import type { CommunityPushType } from 'services/push';

interface Props {
  communityId: string;
  communityName: string;
  currentUser: SerializedUser;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
  token: string | null;
}

const debouncedFetch = debounce(
  ({ communityName, state, scope, page }: any) => {
    return fetch(
      `/api/feed?communityName=${communityName}&state=${state}&scope=${scope}&page=${page}`,
      {
        method: 'GET',
      }
    ).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to fetch the feed.');
    });
  }
);

const debouncedSendMessage = debounce(
  ({ message, communityId, channelId, threadId, imitationId }: any) => {
    return fetch(`/api/messages/thread`, {
      method: 'POST',
      body: JSON.stringify({
        body: message,
        communityId,
        channelId,
        threadId,
        imitationId,
      }),
    });
  },
  100
);

export default function Feed({
  communityId,
  communityName,
  currentUser,
  isSubDomainRouting,
  permissions,
  settings,
  token,
}: Props) {
  const [feed, setFeed] = useState<FeedResponse>({ threads: [], total: 0 });
  const [state, setState] = useState<ThreadState>(ThreadState.OPEN);
  const [scope, setScope] = useState<Scope>(Scope.Participant);
  const [page, setPage] = useState<number>(1);
  const [key, setKey] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [thread, setThread] = useState<SerializedThread>();
  const ref = useRef<HTMLDivElement>(null);
  const [allUsers] = useUsersContext();

  useThreadWebsockets({
    id: thread?.id,
    token,
    permissions,
    onMessage(message, messageId, imitationId) {
      setThread((thread) => {
        if (!thread) {
          return;
        }
        return {
          ...thread,
          messages: [
            ...thread.messages.filter(
              ({ id }: any) => id !== imitationId && id !== messageId
            ),
            message,
          ],
        };
      });
    },
  });

  const onNewMessage = useCallback(
    (payload: CommunityPushType) => {
      const threadId = payload.thread_id;
      fetch('/api/threads/' + threadId)
        .then((response) => response.json())
        .then((thread: SerializedThread) => {
          if (
            scope === Scope.Participant &&
            !thread.messages.find(
              (m) =>
                m.author?.id === currentUser.id ||
                m.mentions.find((me) => me.id === currentUser.id)
            )
          ) {
            return;
          }
          setFeed(({ threads, ...rest }) => ({
            ...rest,
            threads: [thread, ...threads.filter((t) => t.id !== thread.id)],
          }));
        });
    },
    [currentUser.id, scope]
  );

  useFeedWebsockets({
    communityId,
    onNewMessage,
    permissions,
    token,
  });

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
        return;
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

  const [polling] = usePolling(
    {
      fetch() {
        return debouncedFetch({ communityName, state, scope, page });
      },
      success(data: FeedResponse) {
        setFeed(data);
      },
      error() {
        alert('Something went wrong. Please reload the page.');
      },
    },
    [communityName, state, page, scope, key]
  );

  const updateThread = ({
    state: newState,
    title: newTitle,
  }: {
    state?: ThreadState;
    title?: string;
  }) => {
    if (!thread) {
      return;
    }
    const options = {
      state: newState || thread.state,
      title: newTitle || thread.title,
    };
    setThread((thread) => {
      if (!thread) {
        return;
      }
      return {
        ...thread,
        state: options.state,
        title: options.title,
      };
    });

    setFeed((feed) => {
      return {
        ...feed,
        threads: feed.threads.map((feedThread) => {
          if (feedThread.id === thread.id) {
            return {
              ...feedThread,
              state: options.state,
              title: options.title,
            };
          }
          return feedThread;
        }),
      };
    });

    return fetch(`/api/threads/${thread.id}`, {
      method: 'PUT',
      body: JSON.stringify(options),
    })
      .then((response) => {
        if (response.ok) {
          return;
        }
        throw new Error('Failed to close the thread.');
      })
      .catch((exception) => {
        alert(exception.message);
      });
  };

  const sendMessage = async ({
    message,
    channelId,
    threadId,
  }: {
    message: string;
    channelId: string;
    threadId: string;
  }) => {
    const imitation: SerializedMessage = {
      id: uuid(),
      body: message,
      sentAt: new Date().toString(),
      usersId: currentUser.id,
      mentions: allUsers,
      attachments: [],
      reactions: [],
      threadId,
      messageFormat: MessageFormat.LINEN,
      author: {
        id: currentUser.id,
        externalUserId: currentUser.externalUserId,
        displayName: currentUser.displayName,
        profileImageUrl: currentUser.profileImageUrl,
        isBot: false,
        isAdmin: false,
        anonymousAlias: null,
        accountsId: 'fake-account-id',
        authsId: null,
        role: Roles.MEMBER,
      },
    };

    setThread((thread) => {
      if (!thread) {
        return;
      }
      return {
        ...thread,
        messages: [...thread.messages, imitation],
      };
    });

    setFeed((feed) => {
      return {
        ...feed,
        threads: feed.threads.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              messages: [...thread.messages, imitation],
            };
          }
          return thread;
        }),
      };
    });

    return debouncedSendMessage({
      message,
      communityId,
      channelId,
      threadId,
      imitationId: imitation.id,
    })
      .then((response: any) => {
        if (response.ok) {
          return response.json();
        }
        throw 'Could not send a message';
      })
      .then(
        ({
          message,
          imitationId,
        }: {
          message: SerializedMessage;
          imitationId: string;
        }) => {
          setThread((thread: any) => {
            if (!thread) {
              return;
            }
            const messageId = message.id;
            const index = thread.messages.findIndex(
              (message: SerializedMessage) => message.id === messageId
            );
            if (index >= 0) {
              return thread;
            }
            return {
              ...thread,
              messages: [
                ...thread.messages.filter(
                  (message: SerializedMessage) => message.id !== imitationId
                ),
                message,
              ],
            };
          });

          setFeed((feed) => {
            return {
              ...feed,
              threads: feed.threads.map((thread) => {
                if (thread.id === threadId) {
                  const messageId = message.id;
                  const index = thread.messages.findIndex(
                    (message: SerializedMessage) => message.id === messageId
                  );
                  if (index >= 0) {
                    return thread;
                  }
                  return {
                    ...thread,
                    messages: [
                      ...thread.messages.filter(
                        (message: SerializedMessage) =>
                          message.id !== imitationId
                      ),
                      message,
                    ],
                  };
                }
                return thread;
              }),
            };
          });
        }
      );
  };

  return (
    <>
      <SidebarLayout
        left={
          <>
            <Header />
            <Filters
              state={state}
              selections={selections}
              defaultScope={scope}
              onChange={(type: string, value) => {
                setSelections({});
                setPage(1);
                switch (type) {
                  case 'state':
                    return setState(value as ThreadState);
                  case 'scope':
                    return setScope(value as Scope);
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
              loading={polling}
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
          </>
        }
        right={
          thread && (
            <Thread
              key={thread.id}
              id={thread.id}
              channelId={thread.channelId}
              channelName={thread.channel?.channelName as string}
              title={thread.title}
              state={thread.state}
              messages={thread.messages}
              viewCount={thread.viewCount}
              settings={settings}
              incrementId={thread.incrementId}
              isSubDomainRouting={isSubDomainRouting}
              slug={thread.slug}
              permissions={permissions}
              updateThread={updateThread}
              onClose={() => setThread(undefined)}
              sendMessage={sendMessage}
              onSend={() => {
                scrollToBottom(ref.current as HTMLElement);
              }}
              onMount={() => {
                permissions.chat && scrollToBottom(ref.current as HTMLElement);
              }}
            />
          )
        }
        rightRef={ref}
      />
    </>
  );
}
