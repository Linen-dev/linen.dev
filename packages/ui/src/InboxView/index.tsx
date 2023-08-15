import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BiMessageCheck } from '@react-icons/all-files/bi/BiMessageCheck';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
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
  InboxConfig,
  Selections,
  InboxResponse,
  SerializedUser,
} from '@linen/types';
import type { ApiClient } from '@linen/api-client';
import usePolling from '@linen/hooks/polling';
import useKeyboard from '@linen/hooks/keyboard';
import useInboxWebsockets from '@linen/hooks/websockets-inbox';
import { localStorage } from '@linen/utilities/storage';
import debounce from '@linen/utilities/debounce';
import Layouts from '@/Layouts';
import Pages from '@/Pages';
import ProgressModal from '@/ProgressModal';
import Toast from '@/Toast';
import Thread from '@/Thread';
import AddThreadModal from '@/AddThreadModal';
import ConfigureInboxModal from './ConfigureInboxModal';
import Empty from './Empty';
import { addMessageToThread } from './state';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import { createThreadWrapper } from './utilities/createThreadWrapper';
import { manageSelections } from './utilities/selection';
import { defaultConfiguration } from './utilities/inbox';
import { addReactionToThread } from '@linen/utilities/reaction';
import { getFormData } from '@linen/utilities/files';

const { Header, Grid } = Pages.Inbox;
const { SidebarLayout } = Layouts.Shared;

interface Props {
  channels: SerializedChannel[];
  dms: SerializedChannel[];
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
  api: ApiClient;
  useUsersContext: () => [SerializedUser[], any];
}

const LIMIT = 10;

enum ModalView {
  ADD_THREAD,
  CONFIGURE_INBOX,
  PROGRESS,
}

export default function InboxView({
  channels,
  currentCommunity,
  isSubDomainRouting,
  permissions,
  settings,
  dms,
  api,
  useUsersContext,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState<InboxResponse>({ threads: [], total: 0 });
  const [page, setPage] = useState<number>(1);
  const [modal, setModal] = useState<ModalView>();
  const [configuration, setConfiguration] = useState<InboxConfig>(
    defaultConfiguration({ channels: [...channels, ...dms] })
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

  const fetchInbox = async ({
    communityName,
    page,
    limit,
    configuration,
  }: {
    communityName: string;
    page: number;
    limit: number;
    configuration: InboxConfig;
  }) => {
    const channelIds = configuration.channels
      .filter((config) => config.subscribed)
      .map((config) => config.channelId);
    try {
      return await api.fetchInbox({
        communityName,
        page,
        limit,
        channelIds,
      });
    } catch {
      throw new Error('Failed to fetch the inbox.');
    }
  };

  const debouncedFetchInbox = useCallback(debounce(fetchInbox), []);

  const fetchThread = (threadId: string) =>
    api.getThread({ id: threadId, accountId: communityId });

  const putThread = (
    threadId: string,
    options: {
      state?: ThreadState | undefined;
      title?: string | undefined;
    }
  ) =>
    api.updateThread({
      accountId: communityId,
      id: threadId,
      ...options,
    });

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
    api.postReaction({
      communityId: currentCommunity.id,
      messageId,
      type,
      action: active ? 'decrement' : 'increment',
    });
  }
  async function starThread(threadId: string) {
    return api
      .starThread({ threadId, communityId: currentCommunity.id })
      .then(() => {
        Toast.success('Starred successfully.');
      })
      .catch((exception) => {
        if (exception.status === 409) {
          Toast.info('Thread is already starred.');
        } else {
          Toast.error(
            exception?.message || 'Something went wrong. Please try again.'
          );
        }
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
        resolutionId: messageId || null,
        accountId: settings.communityId,
      })
      .catch((_) => {
        Toast.error('Failed to mark as resolution');
      });
  }

  const onNewMessage = (payload: any) => {
    const thread: SerializedThread =
      payload.thread && JSON.parse(payload.thread);
    const message: SerializedMessage =
      payload.message && JSON.parse(payload.message);
    const imitationId: string = payload.imitation_id;
    if (page > 1) {
      return;
    }
    if (thread) {
      if (
        thread.messages.length &&
        currentUser.id === thread.messages[0]?.author?.id
      ) {
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
        return debouncedFetchInbox({
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

  async function uploadFiles(files: File[]) {
    setProgress(0);
    setUploading(true);
    setUploads([]);
    const data = await getFormData(files);
    return api
      .upload(
        { communityId: settings.communityId, data, type: 'attachments' },
        {
          onUploadProgress: (progressEvent: ProgressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      )
      .then(({ files }) => {
        setUploading(false);
        setUploads(files);
      })
      .catch((response) => {
        setUploading(false);
        setUploads([]);
        return response;
      });
  }

  async function onMarkAllAsRead() {
    setModal(ModalView.PROGRESS);
    setThread(undefined);
    setInbox({ threads: [], total: 0 });
    setMarkAllAsReadProgress(0);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMarkAllAsReadProgress(20);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMarkAllAsReadProgress(40);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMarkAllAsReadProgress(60);
    await api.upsertUserThreadStatus({
      communityId: currentCommunity.id,
      threadIds: [],
      muted: false,
      reminder: false,
      read: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMarkAllAsReadProgress(80);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMarkAllAsReadProgress(100);
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
    return api
      .upsertUserThreadStatus({
        communityId: currentCommunity.id,
        threadIds: [threadId],
        muted,
        reminder,
        read,
        reminderType,
      })
      .then(() => {
        return debouncedFetchInbox({
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
    api,
  });

  const createThread = createThreadWrapper({
    currentUser,
    allUsers,
    setThread,
    communityId,
    page,
    api,
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
    localStorage.set('inbox.configuration', configuration);
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
                onStar={starThread}
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
              api={api}
              useUsersContext={useUsersContext}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return api.fetchMentions(term, currentCommunity.id);
              }}
              key={thread.id}
              currentCommunity={currentCommunity}
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
        api={api}
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
        dms={dms}
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
        header="Mark all as read"
        description="This action will run in the background and can take a while to complete, depending on the size of your of your history."
      />
    </>
  );
}
