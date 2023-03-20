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
  onResolve,
  Permissions,
  ReminderTypes,
  SerializedAccount,
  SerializedChannel,
  SerializedReadStatus,
  SerializedThread,
  Settings,
  ThreadState,
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
import * as api from 'utilities/requests';
import ScrollToBottomIcon from './ScrollToBottomIcon';
import IntegrationsModal from 'components/Modals/IntegrationsModal';
import { useRouter } from 'next/router';
import MembersModal from 'components/Modals/MembersModal';

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
  page: number | null;
  isBot: boolean;
  permissions: Permissions;
  currentThreadId: string | undefined;
  token: string | null;
  setThreads: React.Dispatch<React.SetStateAction<SerializedThread[]>>;
  deleteMessage(messageId: string): void;
  muteThread(threadId: string): void;
  unmuteThread(threadId: string): void;
  pinThread(threadId: string): void;
  starThread(threadId: string): void;
  updateThreadResolution: onResolve;
  readThread(threadId: string): void;
  onRemind(threadId: string, reminder: ReminderTypes): void;
  unreadThread(threadId: string): void;
  onSelectThread(threadId?: string): void;
  onMessage(
    threadId: string,
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
  updateThread({ state, title }: { state?: ThreadState; title?: string }): void;
}

const debouncedGetReadStatus = debounce(
  (channelId: string): Promise<SerializedReadStatus> =>
    get(`/api/read-status/${channelId}`)
);
const debouncedUpdateReadStatus = debounce(
  (channelId: string): Promise<SerializedReadStatus> =>
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
  page,
  token,
  permissions,
  currentThreadId,
  setThreads,
  deleteMessage,
  muteThread,
  unmuteThread,
  pinThread,
  starThread,
  updateThreadResolution,
  readThread,
  unreadThread,
  onMessage,
  onDrop,
  onRemind,
  onSelectThread,
  updateThread,
  onThreadMessage,
  sendReaction,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isInfiniteScrollLoading, setInfiniteScrollLoading] = useState(false);
  const [isLeftScrollAtBottom, setIsLeftScrollAtBottom] = useState(true);
  const [readStatus, setReadStatus] = useState<SerializedReadStatus>();
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftBottomRef = useRef<HTMLDivElement>(null);
  const [nextCursor, setNextCursor] = useState(page ? page + 1 : null);
  const [prevCursor, setPrevCursor] = useState(
    page ? page - 1 : currentChannel.pages ? currentChannel.pages - 1 : null
  );
  const [error, setError] = useState<{ prev?: unknown; next?: unknown }>();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [allUsers] = useUsersContext();
  const { startSignUp } = useJoinContext();
  const { mode } = useMode();
  const { query } = useRouter();
  const [integrationsModal, setIntegrationsModal] = useState(
    !!query.integration || false
  );
  const [membersModal, setMembersModal] = useState(false);

  const currentUser = permissions.user || null;

  useEffect(() => {
    if (typeof window !== undefined) {
      const urlHash = new URL(window.document.URL).hash;
      if (!!urlHash) {
        const theadId = urlHash.split('#').join('');
        scrollToIdTop(theadId);
      }
    }
  }, []);

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
    let interval: any;
    const channelId = currentChannel.id;
    if (currentUser) {
      debouncedGetReadStatus(channelId).then(
        (readStatus: SerializedReadStatus) => {
          if (mounted) {
            setReadStatus(readStatus);
          }
        }
      );
      interval = setInterval(() => {
        const channelId = currentChannel.id;
        debouncedUpdateReadStatus(channelId).then(
          (readStatus: SerializedReadStatus) => {
            if (mounted) {
              setReadStatus(readStatus);
            }
          }
        );
      }, UPDATE_READ_STATUS_INTERVAL_IN_MS);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      debouncedUpdateReadStatus(channelId);
      mounted = false;
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

  async function selectThread(threadId: string) {
    const currentThread =
      threads.find((t) => t.id === threadId) ||
      pinnedThreads.find((t) => t.id === threadId);

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
    hasNextPage: !!currentChannel.pages && !!prevCursor && prevCursor > 0,
    onLoadMore: loadMore,
    disabled: !!error?.prev || !prevCursor,
    rootMargin: '0px 0px 0px 0px',
  });

  const [infiniteBottomRef, { rootRef: bottomRootRef }] = useInfiniteScroll({
    loading: isInfiniteScrollLoading,
    hasNextPage:
      !!currentChannel.pages &&
      !!nextCursor &&
      nextCursor <= currentChannel.pages,
    onLoadMore: loadMoreNext,
    disabled: !!error?.next || !nextCursor,
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

  const handleOpenIntegrations = async () => {
    setIntegrationsModal(true);
  };

  const handleOpenMembers = async () => {
    setMembersModal(true);
  };

  function scrollToIdTop(id: string) {
    const scrollableRoot = scrollableRootRef.current;
    if (scrollableRoot) {
      setTimeout(() => {
        const node = document.getElementById(id);
        if (node) {
          node.scrollIntoView();
          scrollableRoot.scrollTop =
            scrollableRoot.scrollTop - scrollableRoot.offsetTop;
        }
      }, 0);
    }
  }

  async function loadMore(next: boolean = false) {
    const key = next ? 'next' : 'prev';
    const dir = next ? 'bottom' : 'top';
    const state = next ? nextCursor : prevCursor;
    if (isInfiniteScrollLoading) return;
    if (!state) return;
    try {
      setInfiniteScrollLoading(true);
      if (state) {
        const data = await api.getThreads({
          channelId: currentChannel.id,
          page: state,
          accountId: settings.communityId,
        });
        if (next) {
          setNextCursor(state + 1);
          setThreads((threads) => [...threads, ...data]);
        } else {
          const index = dir === 'top' ? 0 : threads.length - 1;
          const id = threads[index].id;
          setPrevCursor(state - 1);
          setThreads((threads) => [...data, ...threads]);
          scrollToIdTop(id);
        }
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
            <div ref={infiniteTopRef}></div>
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
                      [styles.pinned]: !!pinnedThread,
                    })}
                    channel={currentChannel}
                    currentUser={currentUser}
                    handleOpenIntegrations={handleOpenIntegrations}
                    handleOpenMembers={handleOpenMembers}
                  >
                    {pinnedThread && (
                      <PinnedThread
                        onClick={() => selectThread(pinnedThread.id)}
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
                    <ScrollToBottomIcon
                      show={!isLeftScrollAtBottom && threads.length > 0}
                      onClick={handleScroll}
                    />
                  </Header>
                  {threads.length === 0 ? (
                    <Empty />
                  ) : (
                    <div className={styles.full}>
                      <ul className="divide-y w-full">
                        <Grid
                          threads={threads}
                          permissions={permissions}
                          readStatus={readStatus}
                          isSubDomainRouting={isSubDomainRouting}
                          currentThreadId={currentThreadId}
                          settings={settings}
                          isBot={false}
                          mode={mode}
                          currentUser={currentUser}
                          onClick={selectThread}
                          onDelete={deleteMessage}
                          onMute={muteThread}
                          onUnmute={unmuteThread}
                          onPin={pinThread}
                          onStar={starThread}
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
                permissions.chat ? (
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
            <div ref={infiniteBottomRef}></div>
            <div ref={leftBottomRef}></div>
          </div>
        }
        leftRef={leftRef}
        onLeftScroll={handleRootScroll}
        right={
          threadToRender && (
            <Thread
              key={threadToRender.id}
              thread={threadToRender}
              channelId={threadToRender.channelId}
              channelName={channelName}
              settings={settings}
              isSubDomainRouting={isSubDomainRouting}
              permissions={permissions}
              currentUser={currentUser}
              updateThread={updateThread}
              onClose={() => onSelectThread(undefined)}
              expanded={collapsed}
              onExpandClick={() => setCollapsed((collapsed) => !collapsed)}
              onResolution={updateThreadResolution}
              sendMessage={sendThreadMessage}
              onDelete={deleteMessage}
              onReaction={sendReaction}
              token={token}
              onSend={() => {
                handleLeftScroll();
              }}
              onMessage={(threadId, message, messageId, imitationId) => {
                const pinned = isLeftScrollAtBottom;
                onMessage(threadId, message, messageId, imitationId);
                if (pinned) {
                  handleScroll();
                }
              }}
            />
          )
        }
        rightRef={rightRef}
        leftClassName={{
          [styles['is-collapsed']]: collapsed,
        }}
        rightClassName={{
          [styles['is-expanded']]: collapsed,
        }}
      />
      <IntegrationsModal
        permissions={permissions}
        open={integrationsModal}
        close={() => setIntegrationsModal(false)}
      />
      <MembersModal
        permissions={permissions}
        open={membersModal}
        close={() => setMembersModal(false)}
      />
    </>
  );
}
