import React, { useCallback, useEffect, useRef, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Thread from '@/Thread';
import Header from './Header';
import Empty from './Empty';
import Chat from './Chat';
import Grid from '@/GridContent';
import Footer from './Footer';
import classNames from 'classnames';
import PinnedThread from './PinnedThread';
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
import Layouts from '@/Layouts';
import { timestamp } from '@linen/utilities/date';
import debounce from '@linen/utilities/debounce';
import { getSelectedText } from '@linen/utilities/document';
import ScrollToBottomIcon from './ScrollToBottomIcon';
import Row from '@/Row';
import ChatLayout from '@/ChatLayout';
import AddThreadModal from '@/AddThreadModal';
import EditThreadModal from '@/EditThreadModal';

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
  pathCursor: string | null;
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
  editThread({
    id,
    message,
    title,
    files,
  }: {
    id: string;
    message: string;
    title: string;
    files: UploadedFile[];
  }): Promise<void>;
  editMessage({ id, body }: { id: string; body: string }): Promise<void>;
  updateThread({ state, title }: { state?: ThreadState; title?: string }): void;
  useJoinContext: () => {
    startSignUp?: any;
  };
  queryIntegration?: string;
  put: (path: string, data?: {}) => Promise<any>;
  get: (path: string) => Promise<any>;
  upload(
    args: {
      communityId: string;
      data: FormData;
    },
    options: any
  ): Promise<any>;
  IntegrationsModal: (args: any) => JSX.Element;
  MembersModal: (args: any) => JSX.Element;
  Pagination: (args: any) => JSX.Element;
  apiGetThreads: (...args: any) => Promise<any>;
  ShowIntegrationDetail(): JSX.Element;
  Actions(): JSX.Element;
  fetchMentions(term: string, communityId: string): any;
  JoinChannelLink(): JSX.Element;
  apiCreateThread: (...args: any) => Promise<any>;
  apiCreateMessage: (...args: any) => Promise<any>;
  playNotificationSound: (volume: number) => Promise<void>;
  useUsersContext(): any;
}

const UPDATE_READ_STATUS_INTERVAL_IN_MS = 30000;

enum ModalView {
  NONE,
  ADD_THREAD,
  EDIT_THREAD,
  MEMBERS,
  INTEGRATIONS,
}

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
  pathCursor,
  setThreads,
  deleteMessage,
  editThread,
  muteThread,
  unmuteThread,
  pinThread,
  starThread,
  updateThreadResolution,
  readThread,
  unreadThread,
  editMessage,
  onMessage,
  onDrop,
  onRemind,
  onSelectThread,
  updateThread,
  onThreadMessage,
  sendReaction,
  // injection
  useJoinContext,
  queryIntegration,
  get,
  put,
  upload,
  IntegrationsModal,
  MembersModal,
  Pagination,
  apiGetThreads,
  ShowIntegrationDetail,
  Actions,
  fetchMentions,
  JoinChannelLink,
  apiCreateMessage,
  apiCreateThread,
  playNotificationSound,
  useUsersContext,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
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
  const [editedThread, setEditedThread] = useState<SerializedThread>();
  const [modal, setModal] = useState<ModalView>(
    queryIntegration ? ModalView.INTEGRATIONS : ModalView.NONE
  );

  const currentUser = permissions.user || null;

  const debouncedGetReadStatus = debounce(
    (channelId: string): Promise<SerializedReadStatus> =>
      get(`/api/read-status/${channelId}`)
  );
  const debouncedUpdateReadStatus = debounce(
    (channelId: string): Promise<SerializedReadStatus> =>
      put(`/api/read-status/${channelId}`, { timestamp: timestamp() })
  );

  useWebsockets({
    room: `room:lobby:${currentChannel.id}`,
    token,
    permissions,
    onNewMessage(payload: any) {
      playNotificationSound(0.2);
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
    const text = getSelectedText();
    if (text) {
      return null;
    }
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
    hasNextPage: !!cursor.prev,
    onLoadMore: loadMore,
    disabled: !!error?.prev || !cursor.prev,
    rootMargin: '0px 0px 0px 0px',
  });

  const [infiniteBottomRef, { rootRef: bottomRootRef }] = useInfiniteScroll({
    loading: isInfiniteScrollLoading,
    hasNextPage: !!cursor.next,
    onLoadMore: loadMoreNext,
    disabled: !!error?.next || !cursor.next,
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

  function showIntegrationsModal() {
    setModal(ModalView.INTEGRATIONS);
  }

  function showMembersModal() {
    setModal(ModalView.MEMBERS);
  }

  function showAddThreadModal() {
    setModal(ModalView.ADD_THREAD);
  }

  function showEditThreadModal(threadId: string) {
    const thread = threads.find(({ id }) => id === threadId);
    setEditedThread(thread);
    setModal(ModalView.EDIT_THREAD);
  }

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
    if (isInfiniteScrollLoading) return;
    if (!cursor[key]) return;
    try {
      setInfiniteScrollLoading(true);
      if (cursor[key]) {
        const data = await apiGetThreads({
          channelId: currentChannel.id,
          cursor: cursor[key] || undefined,
          accountId: settings.communityId,
        });
        if (!data) return;
        setCursor({ ...cursor, [key]: data?.nextCursor?.[key] });
        if (next) {
          setThreads((threads) => [...threads, ...data.threads]);
        } else {
          setThreads((threads) => [...data.threads, ...threads]);
        }
      }

      const index = dir === 'top' ? 0 : threads.length;
      const id = threads[index].id;
      scrollToIdTop(id);
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
    apiCreateThread,
  });

  const sendThreadMessage = sendThreadMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    setUploads,
    setThreads,
    currentThreadId,
    currentCommunity,
    startSignUp,
    apiCreateMessage,
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

  function isPaginationView() {
    return pathCursor && Number(pathCursor) > 0;
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
                    {...{ ShowIntegrationDetail }}
                    className={classNames(styles.header, {
                      [styles.pinned]: !!pinnedThread,
                    })}
                    channel={currentChannel}
                    currentUser={currentUser}
                    permissions={permissions}
                    onAddClick={showAddThreadModal}
                    handleOpenIntegrations={showIntegrationsModal}
                    handleOpenMembers={showMembersModal}
                  >
                    {pinnedThread && (
                      <PinnedThread
                        onClick={() => selectThread(pinnedThread.id)}
                      >
                        <Row
                          {...{ Actions }}
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
                      <ul className={styles.ulFull}>
                        <Grid
                          {...{ Actions }}
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
                          onEdit={showEditThreadModal}
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
                isPaginationView() ? (
                  <>
                    <Pagination
                      {...{
                        currentChannel,
                        isSubDomainRouting,
                        settings,
                        page: pathCursor ? Number(pathCursor) : null,
                      }}
                    />
                    <Footer />
                  </>
                ) : permissions.chat ? (
                  <Chat
                    {...{ fetchMentions }}
                    communityId={settings.communityId}
                    channelId={currentChannel.id}
                    currentUser={currentUser}
                    onDrop={handleDrop}
                    sendMessage={sendMessage}
                    progress={progress}
                    uploads={uploads}
                    uploading={uploading}
                    uploadFiles={uploadFiles}
                    {...{ useUsersContext }}
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
              {...{ Actions, fetchMentions, JoinChannelLink, put, upload }}
              key={threadToRender.id}
              thread={threadToRender}
              channelId={threadToRender.channelId}
              channelName={channelName}
              settings={settings}
              isSubDomainRouting={isSubDomainRouting}
              permissions={permissions}
              currentUser={currentUser}
              updateThread={updateThread}
              editMessage={editMessage}
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
              {...{ useUsersContext }}
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
        open={modal === ModalView.INTEGRATIONS}
        close={() => setModal(ModalView.NONE)}
      />
      <MembersModal
        permissions={permissions}
        open={modal === ModalView.MEMBERS}
        close={() => setModal(ModalView.NONE)}
      />
      <AddThreadModal
        communityId={currentCommunity.id}
        currentUser={currentUser}
        currentChannel={currentChannel}
        open={modal === ModalView.ADD_THREAD}
        close={() => setModal(ModalView.NONE)}
        onSend={({ channelId, title, message }) => {
          setModal(ModalView.NONE);
          return sendMessage({
            message,
            title,
            files: uploads,
            channelId,
          }).then(() => {
            setUploads([]);
          });
        }}
        progress={progress}
        uploading={uploading}
        uploads={uploads}
        uploadFiles={uploadFiles}
      />
      {editedThread && (
        <EditThreadModal
          communityId={currentCommunity.id}
          currentUser={currentUser}
          currentThread={editedThread}
          open={modal === ModalView.EDIT_THREAD}
          close={() => {
            setModal(ModalView.NONE);
            setEditedThread(undefined);
          }}
          onSend={({ title, message }: { title: string; message: string }) => {
            setModal(ModalView.NONE);
            return editThread({
              id: editedThread.id,
              message,
              title,
              files: uploads,
            }).then(() => {
              setUploads([]);
              setEditedThread(undefined);
            });
          }}
          progress={progress}
          uploading={uploading}
          uploads={uploads}
          uploadFiles={uploadFiles}
        />
      )}
    </>
  );
}
