import { useEffect, useState, useRef } from 'react';
import { Layouts, Pages, ProgressModal, Toast } from '@linen/ui';
import Thread from 'components/Thread';
import AddThreadModal from './AddThreadModal';
import ConfigureInboxModal from './ConfigureInboxModal';
import Empty from './Empty';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import { createThreadWrapper } from './utilities/createThreadWrapper';
import { upload } from 'components/MessageForm/api';
import usePolling from '@linen/hooks/polling';
import useKeyboard from '@linen/hooks/keyboard';
import { useUsersContext } from '@linen/contexts/Users';
import useInboxWebsockets from '@linen/hooks/websockets/inbox';
import { BiMessageCheck } from '@react-icons/all-files/bi/BiMessageCheck';
import type { CommunityPushType } from 'services/push';
import { manageSelections } from './utilities/selection';
import {
  ReminderTypes,
  SerializedChannel,
  SerializedMessage,
  SerializedThread,
  Settings,
  ThreadState,
  Permissions,
  SerializedAccount,
  UploadedFile,
} from '@linen/types';
import { addMessageToThread } from './state';
import { defaultConfiguration } from './utilities/inbox';
import { addReactionToThread } from 'utilities/state/reaction';
import { postReaction } from 'components/Pages/Channel/Content/utilities/http';
import * as api from 'utilities/requests';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import { InboxConfig } from '../types';
import storage from '@linen/utilities/storage';

const { Header, Grid } = Pages.Inbox;
const { SidebarLayout } = Layouts.Shared;

interface InboxResponse {
  threads: SerializedThread[];
  total: number;
}

interface Selections {
  [key: string]: {
    checked: boolean;
    index: number;
  };
}

interface Props {
  fetchInbox({
    communityName,
    page,
    limit,
    configuration,
  }: {
    communityName: string;
    page: number;
    limit: number;
    configuration: InboxConfig;
  }): Promise<InboxResponse>;
  fetchThread(threadId: string): Promise<SerializedThread>;
  putThread(
    threadId: string,
    options: {
      state?: ThreadState | undefined;
      title?: string | undefined;
    }
  ): Promise<SerializedThread>;
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

const LIMIT = 10;

enum ModalView {
  ADD_THREAD,
  CONFIGURE_INBOX,
  PROGRESS,
}

export default function Inbox({
  fetchInbox,
  fetchThread,
  putThread,
  channels,
  currentCommunity,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState<InboxResponse>({ threads: [], total: 0 });
  const [page, setPage] = useState<number>(1);
  const [modal, setModal] = useState<ModalView>();
  const [configuration, setConfiguration] = useState<InboxConfig>(
    defaultConfiguration({ channels })
  );
  const [key, setKey] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [thread, setThread] = useState<SerializedThread>();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [markAllAsReadProgress, setMarkAllAsReadProgress] = useState<number>(0);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const [allUsers] = useUsersContext();

  const token = permissions.token || null;
  const currentUser = permissions.user || null;
  const { communityId, communityName } = settings;

  async function sendReaction({
    threadId,
    messageId,
    type,
    active,
  }: {
    threadId: string;
    messageId: string;
    type: string;
    active: boolean;
  }) {
    setThread((thread) => {
      if (!thread) {
        return thread;
      }
      return addReactionToThread(thread, {
        threadId,
        messageId,
        type,
        active,
        currentUser,
      });
    });
    setInbox((inbox) => {
      const { threads, ...rest } = inbox;

      return {
        threads: threads.map((thread) =>
          addReactionToThread(thread, {
            threadId,
            messageId,
            type,
            active,
            currentUser,
          })
        ),
        ...rest,
      };
    });
    postReaction({
      communityId: currentCommunity.id,
      messageId,
      type,
      action: active ? 'decrement' : 'increment',
    });
  }

  async function updateThreadResolution(threadId: string, messageId?: string) {
    setInbox((inbox) => {
      const { threads, ...rest } = inbox;
      return {
        threads: threads.map((thread) => {
          if (thread.id === threadId) {
            return { ...thread, resolutionId: messageId };
          }
          return thread;
        }),
        ...rest,
      };
    });

    setThread((thread) => {
      if (thread?.id === threadId) {
        return {
          ...thread,
          resolutionId: messageId,
        };
      }
      return thread;
    });

    return api
      .updateThread({
        id: threadId,
        resolutionId: messageId,
        accountId: settings.communityId,
      })
      .catch((_) => {
        Toast.error('Failed to mark as resolution');
      });
  }

  const onNewMessage = (payload: CommunityPushType) => {
    const thread: SerializedThread =
      payload.thread && JSON.parse(payload.thread);
    const message: SerializedMessage =
      payload.message && JSON.parse(payload.message);
    const imitationId: string = payload.imitation_id;
    if (page > 1) {
      return;
    }
    if (thread) {
      if (currentUser.id === message.author?.id) {
        return null;
      }

      setInbox((inbox) => {
        const imitation = inbox.threads.find(({ id }) => id === imitationId);
        if (imitation) {
          return {
            threads: inbox.threads.map((current) => {
              if (current.id === imitationId) {
                return thread;
              }
              return current;
            }),
            total: inbox.total,
          };
        }
        return {
          threads: [
            thread,
            ...inbox.threads.filter(({ id }) => id !== thread.id),
          ].splice(0, 10),
          total: inbox.total,
        };
      });
    } else if (message) {
      const thread = inbox.threads.find((t) => t.id === message.threadId);
      if (thread) {
        setInbox((inbox: InboxResponse) => {
          const { threads, ...rest } = inbox;
          if (message) {
            thread.messages = [
              ...thread.messages.filter(
                (m) => m.id !== message.id && m.id !== imitationId
              ),
              message,
            ];
          }
          return {
            ...rest,
            threads: [thread, ...threads.filter((t) => t.id !== thread.id)],
          };
        });
      } else {
        fetchThread(payload.thread_id).then((thread) =>
          setInbox((inbox: InboxResponse) => {
            const { threads, ...rest } = inbox;
            return {
              ...rest,
              threads: [
                thread,
                ...threads.filter((t) => t.id !== thread.id),
              ].splice(0, 10),
            };
          })
        );
      }
    }
  };

  const onThreadMessage = (
    threadId: string,
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ) => {
    setThread((thread) =>
      addMessageToThread(thread, threadId, message, messageId, imitationId)
    );
  };

  useInboxWebsockets({
    communityId,
    onNewMessage,
    permissions,
    token,
  });

  const [polling] = usePolling(
    {
      fetch(): any {
        return fetchInbox({
          communityName,
          page,
          configuration,
          limit: LIMIT,
        });
      },
      success(inbox: InboxResponse) {
        setLoading(false);
        setInbox(inbox);
        setThread(inbox.threads[0]);
      },
      error() {
        Toast.error('Something went wrong. Please reload the page.');
      },
    },
    [communityName, page, key]
  );

  const updateThread = ({
    state,
    title,
  }: {
    state?: ThreadState;
    title?: string;
  }) => {
    if (!thread) {
      return;
    }
    const options: { state?: ThreadState; title?: string } = {};

    if (state) {
      options.state = state;
    }

    if (title) {
      options.title = title;
    }

    setThread((thread) => {
      if (!thread) {
        return;
      }
      return {
        ...thread,
        ...options,
      };
    });

    setInbox((inbox) => {
      return {
        ...inbox,
        threads: inbox.threads.map((inboxThread) => {
          if (inboxThread.id === thread.id) {
            return {
              ...inboxThread,
              ...options,
            };
          }
          return inboxThread;
        }),
      };
    });

    return putThread(thread.id, options)
      .then((_) => {
        if (options.state) {
          setKey((key) => key + 1);
        }
        return;
      })
      .catch((_: Error) => {
        Toast.error('Failed to close the thread.');
      });
  };

  function uploadFiles(files: File[]) {
    setProgress(0);
    setUploading(true);
    setUploads([]);
    const data = new FormData();
    files.forEach((file, index) => {
      data.append(`file-${index}`, file, file.name);
    });
    return upload(
      { communityId: settings.communityId, data },
      {
        onUploadProgress: (progressEvent: ProgressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      }
    )
      .then((response) => {
        setUploading(false);
        const { files } = response.data;
        setUploads(files);
        return response;
      })
      .catch((response) => {
        setUploading(false);
        setUploads([]);
        return response;
      });
  }

  async function onMarkAllAsRead() {
    setModal(ModalView.PROGRESS);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setThread(undefined);
    setInbox({ threads: [], total: 0 });
    setMarkAllAsReadProgress(0);
    await new Promise((resolve) => setTimeout(resolve, 100));
    setMarkAllAsReadProgress(20);
    await new Promise((resolve) => setTimeout(resolve, 100));
    setMarkAllAsReadProgress(40);
    await new Promise((resolve) => setTimeout(resolve, 100));
    setMarkAllAsReadProgress(60);
    await fetch('/api/user-thread-status', {
      method: 'POST',
      body: JSON.stringify({
        communityId: currentCommunity.id,
        threadIds: [],
        muted: false,
        reminder: false,
        read: true,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    setMarkAllAsReadProgress(80);
    await new Promise((resolve) => setTimeout(resolve, 100));
    setMarkAllAsReadProgress(100);
    setModal(undefined);
  }

  function markUserThreadStatuses({
    threadId,
    muted,
    reminder,
    read,
    reminderType,
  }: {
    threadId: string;
    muted: boolean;
    reminder: boolean;
    read: boolean;
    reminderType?: ReminderTypes;
  }) {
    setLoading(true);
    setInbox((inbox) => {
      const { threads, ...rest } = inbox;

      return {
        threads: threads.filter((thread) => thread.id !== threadId),
        ...rest,
      };
    });
    setThread((thread) => {
      if (thread) {
        if (thread.id === threadId) {
          const index = threads.findIndex((thread) => thread.id === threadId);
          return threads[index + 1] || threads[0];
        }
      }
      return thread;
    });
    return fetch('/api/user-thread-status', {
      method: 'POST',
      body: JSON.stringify({
        communityId: currentCommunity.id,
        threadIds: [threadId],
        muted,
        reminder,
        read,
        reminderType,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => {
        return fetchInbox({
          communityName,
          page,
          configuration,
          limit: LIMIT,
        }).then((inbox) => {
          setInbox(inbox);
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function deleteMessage(messageId: string) {
    setInbox((inbox) => {
      const { threads, ...rest } = inbox;
      return {
        threads: threads
          .map((thread) => {
            const message = thread.messages.find(
              (message) => message.id === messageId
            );
            if (message) {
              const messages = thread.messages.filter(
                (message) => message.id !== messageId
              );
              if (messages.length === 0) {
                return null;
              }
              return {
                ...thread,
                messages,
                messageCount: thread.messageCount - 1,
              };
            }
            return thread;
          })
          .filter(Boolean) as SerializedThread[],
        ...rest,
      };
    });

    setThread((thread) => {
      if (thread) {
        const messageIds = thread.messages.map(({ id }) => id);
        if (messageIds.includes(messageId)) {
          const messages = thread.messages.filter(({ id }) => id !== messageId);
          if (messages.length === 0) {
            return undefined;
          }
          return {
            ...thread,
            messages,
          };
        }
      }
      return thread;
    });

    return api
      .deleteMessage({ id: messageId, accountId: currentCommunity.id })
      .then((response) => {
        if (response.ok) {
          return;
        }
        throw new Error('Failed to delete the message.');
      })
      .catch((_) => {
        Toast.error('Failed to delete the message.');
      });
  }

  function markThreadAsRead(threadId: string) {
    markUserThreadStatuses({
      threadId,
      read: true,
      muted: false,
      reminder: false,
    });
  }

  function markThreadAsMuted(threadId: string) {
    markUserThreadStatuses({
      threadId,
      read: false,
      muted: true,
      reminder: false,
    });
  }

  function onRemind(threadId: string, reminderType: ReminderTypes) {
    markUserThreadStatuses({
      threadId,
      muted: false,
      read: false,
      reminder: true,
      reminderType,
    });
  }

  const sendMessage = sendMessageWrapper({
    currentUser,
    allUsers,
    setThread,
    setInbox,
    communityId,
  });

  const createThread = createThreadWrapper({
    currentUser,
    allUsers,
    setThread,
    communityId,
    page,
  });

  const { isShiftPressed } = useKeyboard(
    {
      onKeyUp(event: KeyboardEvent) {
        if (modal) {
          return false;
        }
        const element = document.activeElement;
        if (element && element.id) {
          return false;
        }

        if (event.key === 'c') {
          setModal(ModalView.ADD_THREAD);
        }

        const { threads } = inbox;
        const currentThreadId = thread?.id;
        if (!currentThreadId) {
          return false;
        }
        function selectPreviousThread() {
          const index = threads.findIndex(
            (thread) => thread.id === currentThreadId
          );
          if (index > 0) {
            const thread = threads[index - 1];
            setThread(thread);
          }
        }

        function selectNextThread() {
          const index = threads.findIndex(
            (thread) => thread.id === currentThreadId
          );
          if (index < threads.length - 1) {
            const thread = threads[index + 1];
            setThread(thread);
          }
        }

        if (threads.length > 0) {
          if (event.key === 'ArrowUp' || event.key === 'k') {
            selectPreviousThread();
          } else if (event.key === 'ArrowDown' || event.key === 'j') {
            selectNextThread();
          } else if (event.key === 'e') {
            markThreadAsRead(currentThreadId);
          } else if (event.key === 'm') {
            markThreadAsMuted(currentThreadId);
          }
        }
      },
    },
    [inbox, thread, modal]
  );

  function showAddThreadModal() {
    setModal(ModalView.ADD_THREAD);
  }

  const { threads } = inbox;

  const dropdown = [
    {
      icon: <FiSettings />,
      label: 'Configure',
      onClick: () => {
        setModal(ModalView.CONFIGURE_INBOX);
      },
    },
  ];

  if (threads.length > 0) {
    dropdown.unshift({
      icon: <BiMessageCheck />,
      label: 'Mark all as read',
      onClick: onMarkAllAsRead,
    });
  }

  useEffect(() => {
    storage.set('inbox.configuration', configuration);
    setKey((key) => key + 1);
  }, [configuration]);

  return (
    <>
      <SidebarLayout
        left={
          <>
            <Header
              permissions={permissions}
              total={inbox.total}
              page={page}
              onAddClick={showAddThreadModal}
              onPageChange={(type: string) => {
                switch (type) {
                  case 'back':
                    return setPage((page) => page - 1);
                  case 'next':
                    return setPage((page) => page + 1);
                }
              }}
              dropdown={dropdown}
            />
            {threads.length > 0 ? (
              <Grid
                currentThreadId={thread?.id}
                threads={inbox.threads}
                loading={polling}
                selections={selections}
                permissions={permissions}
                onRead={markThreadAsRead}
                onMute={markThreadAsMuted}
                onRemind={onRemind}
                onChange={(id: string, checked: boolean, index: number) => {
                  setSelections((selections: Selections) => {
                    return manageSelections({
                      id,
                      checked,
                      index,
                      selections,
                      ids: inbox.threads.map((thread) => thread.id),
                      isShiftPressed,
                    });
                  });
                }}
                onSelect={(thread: SerializedThread) => {
                  setThread(thread);
                }}
              />
            ) : (
              <Empty loading={loading} />
            )}
          </>
        }
        right={
          thread && (
            <Thread
              key={thread.id}
              thread={thread}
              channelId={thread.channelId}
              channelName={thread.channel?.channelName as string}
              settings={settings}
              isSubDomainRouting={isSubDomainRouting}
              permissions={permissions}
              currentUser={currentUser}
              onClose={() => setThread(undefined)}
              onReaction={sendReaction}
              onResolution={updateThreadResolution}
              onDelete={deleteMessage}
              updateThread={updateThread}
              sendMessage={sendMessage}
              token={token}
              onMessage={(threadId, message, messageId, imitationId) => {
                onThreadMessage(threadId, message, messageId, imitationId);
              }}
            />
          )
        }
        rightRef={ref}
      />
      <AddThreadModal
        communityId={currentCommunity.id}
        currentUser={currentUser}
        channels={channels}
        open={modal === ModalView.ADD_THREAD}
        close={() => setModal(undefined)}
        onSend={({ channelId, title, message }) => {
          setModal(undefined);
          return createThread({
            message,
            title,
            files: uploads,
            channel: channels.find(
              (channel) => channel.id === channelId
            ) as SerializedChannel,
          }).then(() => {
            setUploads([]);
          });
        }}
        progress={progress}
        uploading={uploading}
        uploads={uploads}
        uploadFiles={uploadFiles}
      />
      <ConfigureInboxModal
        configuration={configuration}
        channels={channels}
        open={modal === ModalView.CONFIGURE_INBOX}
        close={() => setModal(undefined)}
        onChange={(channelId: string) => {
          setConfiguration((configuration) => {
            return {
              ...configuration,
              channels: configuration.channels.map((config) => {
                if (config.channelId === channelId) {
                  return {
                    ...config,
                    subscribed: !config.subscribed,
                  };
                }
                return config;
              }),
            };
          });
        }}
      />
      <ProgressModal
        open={modal === ModalView.PROGRESS}
        close={() => setModal(undefined)}
        progress={markAllAsReadProgress}
      />
    </>
  );
}
