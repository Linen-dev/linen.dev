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
import { SerializedMessage } from '@linen/types';
import {
  scrollToBottom,
  isScrollAtBottom,
  isInViewport,
} from '@linen/utilities/scroll';
import useMode from '@linen/hooks/mode';
import useWebsockets from '@linen/hooks/websockets';
import styles from './index.module.scss';
import Layouts from '@/Layouts';
import { timestamp } from '@linen/utilities/date';
import debounce from '@linen/utilities/debounce';
import { getSelectedText } from '@linen/utilities/document';
import ScrollToBottomIcon from './ScrollToBottomIcon';
import Row from '@/Row';
import ChatLayout from '@/ChatLayout';
import AddThreadModal from '@/AddThreadModal';
import EditThreadModal from '@/EditThreadModal';
import ConfirmationModal from '@/ConfirmationModal';
import Toast from '@/Toast';
import type { ApiClient } from '@linen/api-client';
import IntegrationsModalUI from '@/IntegrationsModal';
import { copyToClipboard } from '@linen/utilities/clipboard';
import MembersModal from '@/MembersModal';
import PaginationNumbers from '@/PaginationNumbers';

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
  playNotificationSound: (volume: number) => Promise<void>;
  useUsersContext(): any;
  usePath(options: any): any;
  routerPush(path: string): void;
  api: ApiClient;
}

const UPDATE_READ_STATUS_INTERVAL_IN_MS = 30000;

enum ModalView {
  NONE,
  ADD_THREAD,
  EDIT_THREAD,
  MEMBERS,
  INTEGRATIONS,
  HIDE_CHANNEL,
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
  playNotificationSound,
  useUsersContext,
  usePath,
  routerPush,
  api,
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
  const membersPath = usePath({ href: '/members' });

  const currentUser = permissions.user || null;

  const debouncedGetReadStatus = debounce(api.getReadStatus);

  const debouncedUpdateReadStatus = debounce(api.updateReadStatus);

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
        debouncedUpdateReadStatus(channelId, timestamp()).then(
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
      debouncedUpdateReadStatus(channelId, timestamp());
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

  function showHideChannelModal() {
    setModal(ModalView.HIDE_CHANNEL);
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
        const data = await api.getThreads({
          channelId: currentChannel.id,
          cursor: cursor[key] || undefined,
          accountId: currentCommunity.id,
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
    api,
  });

  const sendThreadMessage = sendThreadMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    setUploads,
    setThreads,
    currentThreadId,
    currentCommunity,
    startSignUp,
    api,
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
    return api
      .upload(
        { communityId: currentCommunity.id, data, type: 'attachment' },
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
                    className={classNames(styles.header, {
                      [styles.pinned]: !!pinnedThread,
                    })}
                    channel={currentChannel}
                    currentUser={currentUser}
                    permissions={permissions}
                    onAddClick={showAddThreadModal}
                    handleOpenIntegrations={showIntegrationsModal}
                    handleOpenMembers={showMembersModal}
                    onHideChannelClick={showHideChannelModal}
                    api={api}
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
                    <Empty
                      onInvite={
                        permissions.manage
                          ? () => {
                              routerPush(membersPath);
                            }
                          : undefined
                      }
                      onShare={() => {
                        copyToClipboard(window.location.href);
                        Toast.success('Copied to clipboard');
                      }}
                    />
                  ) : (
                    <div className={styles.full}>
                      <ul className={styles.ulFull}>
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
                    <PaginationNumbers
                      currentChannel={currentChannel}
                      isSubDomainRouting={isSubDomainRouting}
                      settings={settings}
                      page={pathCursor ? Number(pathCursor) : null}
                    />
                    <Footer />
                  </>
                ) : (
                  <>
                    {!currentCommunity.communityInviteUrl && (
                      <Chat
                        communityId={currentCommunity.id}
                        channelId={currentChannel.id}
                        currentUser={currentUser}
                        onDrop={handleDrop}
                        sendMessage={sendMessage}
                        progress={progress}
                        uploads={uploads}
                        uploading={uploading}
                        uploadFiles={currentUser && uploadFiles}
                        useUsersContext={useUsersContext}
                        fetchMentions={(term?: string) => {
                          if (!currentUser) {
                            return Promise.resolve([]);
                          }
                          if (!term) return Promise.resolve([]);
                          return api.fetchMentions(term, currentCommunity.id);
                        }}
                      />
                    )}
                    <Footer />
                  </>
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
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return api.fetchMentions(term, currentCommunity.id);
              }}
              api={api}
              useUsersContext={useUsersContext}
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

      <IntegrationsModalUI.IntegrationsModal
        permissions={permissions}
        open={modal === ModalView.INTEGRATIONS}
        close={() => setModal(ModalView.NONE)}
        api={api}
        channel={currentChannel}
      />
      <MembersModal
        permissions={permissions}
        open={modal === ModalView.MEMBERS}
        close={() => setModal(ModalView.NONE)}
        api={api}
      />
      <AddThreadModal
        api={api}
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
      <ConfirmationModal
        open={modal === ModalView.HIDE_CHANNEL}
        close={() => setModal(ModalView.NONE)}
        title={`Hide #${currentChannel.channelName}`}
        description={`Are you sure you want to hide the #${currentChannel.channelName} channel? It won't be available to the members of your community anymore.`}
        onConfirm={() => {
          setModal(ModalView.NONE);
          api
            .hideChannel({
              accountId: currentCommunity.id,
              channelId: currentChannel.id,
            })
            .then(() => {
              Toast.success(`#${currentChannel.channelName} is hidden`);

              setTimeout(() => {
                window.location.href = window.location.href.replace(
                  new RegExp(`/c/${currentChannel.channelName}`, 'g'),
                  ''
                );
              }, 1000);
            })
            .catch(() => {
              Toast.error('Something went wrong. Please try again.');
            });
        }}
      />
      {editedThread && (
        <EditThreadModal
          api={api}
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
