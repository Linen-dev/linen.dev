import React, { useCallback, useEffect, useRef, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Thread from 'components/Thread';
import { get, put } from 'utilities/http';
import { useUsersContext } from '@linen/contexts/Users';
import ChatLayout from 'components/layout/shared/ChatLayout';
import { upload } from 'components/MessageForm/api';
import Header from './Header';
import Empty from './Empty';
import Chat from './Chat';
import Grid from './Grid';
import Footer from './Footer';
import classNames from 'classnames';
import PinnedThread from './PinnedThread';
import Row from './Row';
import { useJoinContext } from 'contexts/Join';
import { sendThreadMessageWrapper } from './sendThreadMessageWrapper';
import { sendMessageWrapper } from './sendMessageWrapper';
import {
  Permissions,
  ReminderTypes,
  SerializedAccount,
  SerializedChannel,
  SerializedReadStatus,
  SerializedThread,
  Settings,
  ThreadState,
  ThreadStatus,
  UploadedFile,
} from '@linen/types';
import {
  scrollToBottom,
  isScrollAtBottom,
  isInViewport,
} from '@linen/utilities/scroll';
import useMode from '@linen/hooks/mode';
import useWebsockets from '@linen/hooks/websockets';
import styles from './index.module.scss';
import { SerializedMessage } from '@linen/types';
import { Layouts } from '@linen/ui';
import { timestamp } from '@linen/utilities/date';
import debounce from '@linen/utilities/debounce';
import { FiArrowDown } from 'react-icons/fi';
import * as api from 'utilities/requests';

const { SidebarLayout } = Layouts.Shared;

interface Props {
  settings: Settings;
  channelName: string;
  channels?: SerializedChannel[];
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  threads: SerializedThread[];
  pinnedThreads: SerializedThread[];
  isSubDomainRouting: boolean;
  nextCursor: {
    next: string | null;
    prev: string | null;
  };
  isBot: boolean;
  permissions: Permissions;
  currentThreadId: string | undefined;
  token: string | null;
  status: ThreadStatus;
  onStatusChange(status: ThreadStatus): void;
  setThreads: React.Dispatch<React.SetStateAction<SerializedThread[]>>;
  onThreadsChange(threads: SerializedThread[]): void;
  deleteMessage(messageId: string): void;
  muteThread(threadId: string): void;
  unmuteThread(threadId: string): void;
  pinThread(threadId: string): void;
  readThread(threadId: string): void;
  onRemind(threadId: string, reminder: ReminderTypes): void;
  unreadThread(threadId: string): void;
  sendReaction({
    threadId,
    messageId,
    type,
    active,
  }: {
    threadId: string;
    messageId: string;
    type: string;
    active: boolean;
  }): void;
  onSelectThread(threadId?: string): void;
  onMessage(
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ): void;
  onThreadMessage(payload: any): void;
  onDrop({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    from: string;
    to: string;
  }): void;
  updateThread({ state, title }: { state?: ThreadState; title?: string }): void;
  onMarkAllAsRead(): void;
}

const debouncedGetReadStatus = debounce((channelId: string) =>
  get(`/api/read-status/${channelId}`)
);
const debouncedUpdateReadStatus = debounce((channelId: string) =>
  put(`/api/read-status/${channelId}`, { timestamp: timestamp() })
);

const UPDATE_READ_STATUS_INTERVAL_IN_MS = 30000;

export default function Channel({
  threads,
  pinnedThreads,
  currentChannel,
  currentCommunity,
  settings,
  channelName,
  isSubDomainRouting,
  nextCursor,
  token,
  permissions,
  currentThreadId,
  status,
  onStatusChange,
  setThreads,
  onThreadsChange,
  deleteMessage,
  muteThread,
  unmuteThread,
  pinThread,
  readThread,
  unreadThread,
  onMessage,
  onDrop,
  onRemind,
  sendReaction,
  onSelectThread,
  updateThread,
  onThreadMessage,
  onMarkAllAsRead,
}: Props) {
  const [isLoading, setLoading] = useState(false);
  const [isInfiniteScrollLoading, setInfiniteScrollLoading] = useState(false);
  const [isLeftScrollAtBottom, setIsLeftScrollAtBottom] = useState(true);
  const [readStatus, setReadStatus] = useState<SerializedReadStatus>();
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftBottomRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(nextCursor);
  const [error, setError] = useState<{ prev?: unknown; next?: unknown }>();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [allUsers] = useUsersContext();
  const { startSignUp } = useJoinContext();
  const { mode } = useMode();

  const currentUser = permissions.user || null;

  useWebsockets({
    room: `room:lobby:${currentChannel.id}`,
    token,
    permissions,
    onNewMessage(payload) {
      const pinned = isLeftScrollAtBottom;
      onThreadMessage(payload);
      if (pinned) {
        setTimeout(() => handleScroll(), 0);
      }
    },
  });

  useEffect(() => {
    let mounted = true;
    const channelId = currentChannel.id;
    if (currentUser) {
      debouncedGetReadStatus(channelId).then(
        (readStatus: SerializedReadStatus) => {
          if (mounted) {
            setReadStatus(readStatus);
            return debouncedUpdateReadStatus(channelId);
          }
        }
      );
    }
    return () => {
      debouncedUpdateReadStatus(channelId);
      mounted = false;
    };
  }, [currentChannel]);

  useEffect(() => {
    const interval = setInterval(() => {
      const channelId = currentChannel.id;
      debouncedUpdateReadStatus(channelId);
    }, UPDATE_READ_STATUS_INTERVAL_IN_MS);
    return () => {
      clearInterval(interval);
    };
  }, [currentChannel]);

  function handleScroll() {
    scrollToBottom(scrollableRootRef.current as HTMLElement);
  }

  function handleLeftScroll() {
    if (
      isLeftScrollAtBottom ||
      isInViewport(leftBottomRef.current as HTMLElement)
    ) {
      setTimeout(() => handleScroll, 0);
    }
  }

  async function selectThread(incrementId: number) {
    const currentThread = threads.find((t) => t.incrementId === incrementId);
    if (!currentThread) {
      return;
    }
    onSelectThread(currentThread.id);
    const isLastThread = currentThread.id === threads[threads.length - 1].id;
    if (isLastThread) {
      setTimeout(() => handleScroll(), 0);
    }
    handleLeftScroll();
  }

  const [infiniteTopRef, { rootRef: topRootRef }] = useInfiniteScroll({
    loading: isInfiniteScrollLoading,
    hasNextPage: !!cursor.prev,
    onLoadMore: loadMore,
    disabled: !!error?.prev || !cursor.prev || isLoading,
    rootMargin: '0px 0px 0px 0px',
  });

  const [infiniteBottomRef, { rootRef: bottomRootRef }] = useInfiniteScroll({
    loading: isInfiniteScrollLoading,
    hasNextPage: !!cursor.next,
    onLoadMore: loadMoreNext,
    disabled: !!error?.next || !cursor.next || isLoading,
    rootMargin: '0px 0px 0px 0px',
  });

  useEffect(() => {
    handleScroll();
  }, []);

  const leftRef = useCallback(
    (node: HTMLDivElement) => {
      bottomRootRef(node);
      topRootRef(node);
      scrollableRootRef.current = node;
    },
    [topRootRef, bottomRootRef]
  );

  const handleRootScroll = () => {
    const rootNode = scrollableRootRef.current;
    if (rootNode) {
      setIsLeftScrollAtBottom(isScrollAtBottom(rootNode));
    }
  };

  const handleStatusChange = async (status: ThreadStatus) => {
    setLoading(true);
    onThreadsChange([]);
    setCursor({ prev: null, next: null });
    onStatusChange(status);
    try {
      const data = await api.getThreads({
        channelId: currentChannel.id,
        accountId: settings.communityId,
        userId: currentUser?.id,
        status,
      });
      onThreadsChange(data.threads);
      setTimeout(() => {
        handleScroll();
        setCursor(data.nextCursor);
      }, 0);
    } catch (exception) {
      alert('Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    setLoading(true);
    try {
      await onMarkAllAsRead();
    } finally {
      setLoading(false);
    }
  };

  async function loadMore(next: boolean = false) {
    const key = next ? 'next' : 'prev';
    const dir = next ? 'bottom' : 'top';
    if (isInfiniteScrollLoading) return;
    if (isLoading) return;
    if (!cursor[key]) return;
    try {
      setInfiniteScrollLoading(true);
      if (cursor[key]) {
        const data = await api.getThreads({
          channelId: currentChannel.id,
          cursor: cursor[key] || undefined,
          accountId: settings.communityId,
          userId: currentUser?.id,
          status,
        });
        setCursor({ ...cursor, [key]: data?.nextCursor?.[key] });
        if (next) {
          setThreads((threads) => [...threads, ...data.threads]);
        } else {
          setThreads((threads) => [...data.threads, ...threads]);
        }
      }
      const scrollableRoot = scrollableRootRef.current;
      if (scrollableRoot) {
        const index = dir === 'top' ? 0 : threads.length;
        const id = threads[index].id;
        setTimeout(() => {
          const node = document.getElementById(`channel-thread-${id}`);
          if (node) {
            node.scrollIntoView();
          }
        }, 0);
      }
    } catch (err) {
      setError({ ...error, [key]: err });
    } finally {
      setInfiniteScrollLoading(false);
    }
  }

  async function loadMoreNext() {
    loadMore(true);
  }

  const sendMessage = sendMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    currentChannel,
    setUploads,
    setThreads,
    scrollableRootRef,
    currentCommunity,
    startSignUp,
  });

  const sendThreadMessage = sendThreadMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    setUploads,
    setThreads,
    currentThreadId,
    currentCommunity,
    startSignUp,
  });

  const threadToRender = threads.find(
    (thread) => thread.id === currentThreadId
  );

  const pinnedThread = pinnedThreads[pinnedThreads.length - 1];

  const handleDrop = ({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    from: string;
    to: string;
  }) => {
    onDrop({ source, target, from, to });
    handleLeftScroll();
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

  return (
    <>
      <SidebarLayout
        left={
          <div
            className={classNames(styles.container, {
              [styles['has-chat']]: permissions.chat,
              [styles['is-empty']]: threads.length === 0,
            })}
          >
            {cursor?.prev && !error?.prev && <div ref={infiniteTopRef}></div>}
            <ChatLayout
              onDrop={(event: React.DragEvent) => {
                event.preventDefault();
                event.stopPropagation();
                const files = Array.from(event.dataTransfer.files || []);
                if (files.length > 0) {
                  uploadFiles(files);
                }
              }}
              content={
                <>
                  <Header
                    className={classNames(styles.header, {
                      [styles.pinned]:
                        !!pinnedThread && status === ThreadStatus.UNREAD,
                    })}
                    channelName={currentChannel.channelName}
                    currentUser={currentUser}
                    status={status}
                    threads={threads}
                    onMarkAllAsRead={handleMarkAsRead}
                    onStatusChange={handleStatusChange}
                  >
                    {pinnedThread && status === ThreadStatus.UNREAD && (
                      <PinnedThread
                        onClick={() => selectThread(pinnedThread.incrementId)}
                      >
                        <Row
                          thread={pinnedThread}
                          permissions={permissions}
                          isSubDomainRouting={isSubDomainRouting}
                          settings={settings}
                          currentUser={currentUser}
                          onDelete={deleteMessage}
                          onPin={pinThread}
                          onReaction={sendReaction}
                        />
                      </PinnedThread>
                    )}
                    <div
                      className={classNames(styles.jump, {
                        [styles.hidden]: isLeftScrollAtBottom,
                      })}
                      onClick={handleScroll}
                    >
                      <FiArrowDown className={styles.icon} />
                    </div>
                  </Header>
                  {threads.length === 0 ? (
                    <Empty status={status} loading={isLoading} />
                  ) : (
                    <div className={styles.full} key={status}>
                      <ul className="divide-y w-full">
                        <Grid
                          threads={threads}
                          permissions={permissions}
                          readStatus={readStatus}
                          isSubDomainRouting={isSubDomainRouting}
                          currentThreadId={currentThreadId}
                          settings={settings}
                          status={status}
                          isBot={false}
                          mode={mode}
                          currentUser={currentUser}
                          onClick={selectThread}
                          onDelete={deleteMessage}
                          onMute={muteThread}
                          onUnmute={unmuteThread}
                          onPin={pinThread}
                          onReaction={sendReaction}
                          onRead={readThread}
                          onRemind={onRemind}
                          onUnread={unreadThread}
                          onDrop={handleDrop}
                          onLoad={handleLeftScroll}
                        />
                      </ul>
                    </div>
                  )}
                </>
              }
              footer={
                permissions.chat && status === ThreadStatus.UNREAD ? (
                  <Chat
                    communityId={settings.communityId}
                    channelId={currentChannel.id}
                    currentUser={currentUser}
                    onDrop={handleDrop}
                    sendMessage={sendMessage}
                    progress={progress}
                    uploads={uploads}
                    uploading={uploading}
                    uploadFiles={uploadFiles}
                  />
                ) : (
                  <Footer />
                )
              }
            />
            {cursor.next && !error?.next && <div ref={infiniteBottomRef}></div>}
            <div ref={leftBottomRef}></div>
          </div>
        }
        leftRef={leftRef}
        onLeftScroll={handleRootScroll}
        right={
          threadToRender && (
            <Thread
              thread={threadToRender}
              key={threadToRender.id}
              channelId={threadToRender.channelId}
              channelName={channelName}
              settings={settings}
              isSubDomainRouting={isSubDomainRouting}
              threadUrl={null}
              permissions={permissions}
              currentUser={currentUser}
              mode={mode}
              updateThread={updateThread}
              onClose={() => onSelectThread(undefined)}
              sendMessage={sendThreadMessage}
              onDelete={deleteMessage}
              onReaction={sendReaction}
              token={token}
              onSend={() => {
                handleLeftScroll();
              }}
              onMessage={(message, messageId, imitationId) => {
                const pinned = isLeftScrollAtBottom;
                onMessage(message, messageId, imitationId);
                if (pinned) {
                  handleScroll();
                }
              }}
            />
          )
        }
        rightRef={rightRef}
      />
    </>
  );
}
