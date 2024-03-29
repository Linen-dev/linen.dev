import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect as useClientLayoutEffect,
} from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import NProgress from 'nprogress';
import Thread from '@/Thread';
import Header from '../Header';
import Empty from '../Empty';
import Chat from '../Chat';
import Grid from './Grid';
import Footer from '../Footer';
import classNames from 'classnames';
import PinnedThread from '../PinnedThread';
import { createMessageWrapper } from '../utilities/createMessageWrapper';
import { createThreadWrapper } from '../utilities/createThreadWrapper';
import {
  onResolve,
  Permissions,
  ReminderTypes,
  SerializedAccount,
  SerializedChannel,
  SerializedReadStatus,
  SerializedThread,
  SerializedTopic,
  Settings,
  StartSignUpProps,
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
import ScrollToBottomIcon from '../ScrollToBottomIcon';
import Row from '@/Row';
import ChatLayout from '@/ChatLayout';
import AddThreadModal from '@/AddThreadModal';
import EditThreadModal from '@/EditThreadModal';
import EditMessageModal from '@/EditMessageModal';
import { getFormData } from '@linen/utilities/files';
import type { ApiClient } from '@linen/api-client';
import PaginationNumbers from '@/PaginationNumbers';
import { useViewport } from '@linen/hooks/useViewport';
import { TypingFunctions } from '@/Thread/UsersTyping';
import EventEmitter from '@linen/utilities/event';

const useLayoutEffect =
  typeof window !== 'undefined' ? useClientLayoutEffect : () => {};

const { SidebarLayout } = Layouts.Shared;

interface Props {
  settings: Settings;
  channelName: string;
  channels?: SerializedChannel[];
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  threads: SerializedThread[];
  topics: SerializedTopic[];
  pinnedThreads: SerializedThread[];
  isSubDomainRouting: boolean;
  pathCursor: string | null;
  isBot: boolean;
  permissions: Permissions;
  currentThreadId: string | undefined;
  token: string | null;
  setThreads: React.Dispatch<React.SetStateAction<SerializedThread[]>>;
  setTopics: React.Dispatch<React.SetStateAction<SerializedTopic[]>>;
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
  onShare(): void;
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
  }): Promise<SerializedThread | void>;
  editMessage({
    id,
    body,
  }: {
    id: string;
    body: string;
  }): Promise<SerializedMessage | void>;
  updateThread({ state, title }: { state?: ThreadState; title?: string }): void;
  queryIntegration?: string;
  playNotificationSound: (volume: number) => Promise<void>;
  useUsersContext(): any;
  usePath(options: any): any;
  routerPush(path: string): void;
  api: ApiClient;
  startSignUp: (props: StartSignUpProps) => Promise<void>;
  activeUsers: string[];
}

const UPDATE_READ_STATUS_INTERVAL_IN_MS = 30000;

enum ModalView {
  NONE,
  ADD_THREAD,
  EDIT_THREAD,
  EDIT_MESSAGE,
}

export default function Channel({
  threads,
  topics,
  pinnedThreads,
  currentChannel,
  currentCommunity,
  settings,
  channelName,
  isSubDomainRouting,
  token,
  permissions,
  currentThreadId,
  pathCursor,
  setThreads,
  setTopics,
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
  onShare,
  onRemind,
  onSelectThread,
  updateThread,
  onThreadMessage,
  sendReaction,
  // injection
  queryIntegration,
  playNotificationSound,
  useUsersContext,
  usePath,
  routerPush,
  api,
  startSignUp,
  activeUsers,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isInfiniteScrollLoading, setInfiniteScrollLoading] = useState(false);
  const [isLeftScrollAtBottom, setIsLeftScrollAtBottom] = useState(true);
  const [isScrolling, setIsScrolling] = useState(true);
  const [readStatus, setReadStatus] = useState<SerializedReadStatus>();
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const lastScrollDistanceToBottomRef = useRef<number>();
  const rightRef = useRef<HTMLDivElement>(null);
  const leftBottomRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<{ prev?: unknown; next?: unknown }>();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [allUsers] = useUsersContext();
  const { mode } = useMode();
  const [editedThread, setEditedThread] = useState<SerializedThread>();
  const [editedMessage, setEditedMessage] = useState<SerializedMessage>();
  const [modal, setModal] = useState<ModalView>(ModalView.NONE);
  const membersPath = usePath({ href: '/members' });
  const viewport = useViewport();

  const currentUser = permissions.user || null;

  useLayoutEffect(() => {
    if (!isInfiniteScrollLoading) {
      scrollDown();
      setTimeout(() => setIsScrolling(false), 10);
      viewport === 'mobile' && NProgress.done();
    } else {
      viewport === 'mobile' && NProgress.start();
    }
  }, [viewport, isInfiniteScrollLoading]);

  useEffect(() => {
    const callback = (topic: SerializedTopic) => {
      selectThread(topic.threadId, false);

      const node = document.getElementById(
        `channel-grid-item-${topic.messageId}`
      );

      const layout = document.getElementById('sidebar-layout-left');
      const footer = document.getElementById('chat-layout-footer');
      if (node && layout && footer) {
        node.scrollIntoView({ block: 'end' });
        const offset = footer.clientHeight;
        layout.scrollTop = layout.scrollTop + offset;
      }
    };

    EventEmitter.on('navbar:topic:clicked', callback);

    return () => {
      EventEmitter.off('navbar:topic:clicked', callback);
    };
  }, []);

  async function loadMore(next: boolean = false) {
    if (isInfiniteScrollLoading || isScrolling) return;
    try {
      setInfiniteScrollLoading(true);
      const data = await api.findTopics({
        channelId: currentChannel.id,
        sentAt: new Date(topics[0].sentAt),
        accountId: currentCommunity.id,
      });
      if (data) {
        if (next) {
          setThreads((threads) => [...threads, ...data.threads]);
          setTopics((topics) => [...topics, ...data.topics]);
        } else {
          setThreads((threads) => [...data.threads, ...threads]);
          setTopics((topics) => [...data.topics, ...topics]);
        }
      }
      setIsScrolling(true);
      setInfiniteScrollLoading(false);
    } catch (err) {
      setError({ ...error });
      setInfiniteScrollLoading(false);
    }
  }

  async function loadMoreNext() {
    return loadMore(true);
  }

  const debouncedGetReadStatus = useCallback(debounce(api.getReadStatus), []);

  const debouncedUpdateReadStatus = useCallback(
    debounce(api.updateReadStatus),
    []
  );

  const { userTyping, usersTyping } = useWebsockets({
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

  const [isUserTyping, setUserTyping] = useState(false);

  const { onKeyDown, onKeyUp } = TypingFunctions({
    currentUser,
    isUserTyping,
    setUserTyping,
    userTyping,
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
        channelId &&
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
      currentUser &&
        channelId &&
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
      setTimeout(() => handleScroll(), 0);
    }
  }

  async function selectThread(threadId: string, scroll: boolean = true) {
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

    scroll && handleLeftScroll();
  }

  const rootMargin =
    viewport === 'desktop' ? '640px 0px 640px 0px' : '0px 0px 0px 0px';

  const [infiniteTopRef, { rootRef: topRootRef }] = useInfiniteScroll({
    loading: isInfiniteScrollLoading || isScrolling,
    hasNextPage: true,
    onLoadMore: loadMore,
    disabled: !!error || isScrolling,
    rootMargin,
    delayInMs: 0,
  });

  useEffect(() => {
    handleScroll();
  }, []);

  const leftRef = useCallback(
    (node: HTMLDivElement) => {
      topRootRef(node);
      scrollableRootRef.current = node;
    },
    [topRootRef]
  );

  const handleRootScroll = () => {
    const rootNode = scrollableRootRef.current;
    if (rootNode) {
      setIsLeftScrollAtBottom(isScrollAtBottom(rootNode));
      const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
      lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
    }
  };

  function showAddThreadModal() {
    setModal(ModalView.ADD_THREAD);
  }

  function onEdit(threadId: string, messageId: string) {
    const thread = threads.find(({ id }) => id === threadId);
    if (thread) {
      const index = thread.messages.findIndex(
        (message) => message.id === messageId
      );
      if (index > 0) {
        const message = thread.messages[index];
        setEditedMessage(message);
        setModal(ModalView.EDIT_MESSAGE);
      } else {
        const message = thread.messages[0];
        setEditedThread(thread);
        setEditedMessage(message);
        setModal(ModalView.EDIT_THREAD);
      }
    }
  }

  function scrollDown(offset = 0) {
    const scrollableRoot = scrollableRootRef.current;
    const lastScrollDistanceToBottom =
      lastScrollDistanceToBottomRef.current || 0;
    if (scrollableRoot) {
      scrollableRoot.scrollTop =
        scrollableRoot.scrollHeight - lastScrollDistanceToBottom + offset;
    }
  }

  const debouncedCreateThread = useCallback(
    debounce(api.createThread, 100),
    []
  );

  const sendMessage = createThreadWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    currentChannel,
    setUploads,
    setThreads,
    setTopics,
    scroll() {
      scrollToBottom(scrollableRootRef.current as HTMLDivElement);
    },
    currentCommunity,
    startSignUp,
    createThread: debouncedCreateThread,
  });

  const debouncedCreateMessage = useCallback(
    debounce(api.createMessage, 100),
    []
  );

  const sendThreadMessage = createMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    setUploads,
    setThreads,
    setTopics,
    currentThreadId,
    currentCommunity,
    startSignUp,
    createMessage: debouncedCreateMessage,
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

  async function uploadFiles(files: File[]) {
    setProgress(0);
    setUploading(true);
    setUploads([]);
    const data = await getFormData(files);
    return api
      .upload(
        { communityId: currentCommunity.id, data, type: 'attachments' },
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
            {!error && !isScrolling && <div ref={infiniteTopRef}></div>}
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
                          activeUsers={activeUsers}
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
                      onShare={onShare}
                    />
                  ) : (
                    <div className={styles.full}>
                      <ul className={styles.ulFull}>
                        <Grid
                          currentChannel={currentChannel}
                          currentCommunity={currentCommunity}
                          threads={threads}
                          topics={topics}
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
                          onEdit={onEdit}
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
                          activeUsers={activeUsers}
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
                    {!currentUser && <Footer />}
                  </>
                ) : (
                  <>
                    {!currentChannel.readonly && permissions.chat && (
                      <Chat
                        channel={currentChannel}
                        currentUser={currentUser}
                        onDrop={handleDrop}
                        sendMessage={sendMessage}
                        progress={progress}
                        uploads={uploads}
                        uploading={uploading}
                        uploadFiles={currentUser ? uploadFiles : undefined}
                        useUsersContext={useUsersContext}
                        fetchMentions={(term?: string) => {
                          if (!currentUser) {
                            return Promise.resolve([]);
                          }
                          if (!term) return Promise.resolve([]);
                          return api.fetchMentions(term, currentCommunity.id);
                        }}
                        onKeyDown={onKeyDown}
                        onKeyUp={onKeyUp}
                        usersTyping={usersTyping}
                      />
                    )}
                    {!currentUser && <Footer />}
                  </>
                )
              }
            />
            <div ref={leftBottomRef}></div>
          </div>
        }
        leftRef={leftRef}
        onLeftScroll={handleRootScroll}
        right={
          threadToRender && (
            <Thread
              sidebar
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return api.fetchMentions(term, currentCommunity.id);
              }}
              currentCommunity={currentCommunity}
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
              onClose={() => {
                onSelectThread(undefined);
              }}
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
              activeUsers={activeUsers}
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

      {editedThread && editedMessage && (
        <EditThreadModal
          api={api}
          communityId={currentCommunity.id}
          currentUser={currentUser}
          currentThread={editedThread}
          open={modal === ModalView.EDIT_THREAD}
          close={() => {
            setModal(ModalView.NONE);
            setEditedThread(undefined);
            setEditedMessage(undefined);
          }}
          onSend={async ({
            title,
            message,
          }: {
            title: string;
            message: string;
          }) => {
            setModal(ModalView.NONE);
            await editMessage({
              id: editedMessage.id,
              body: message,
            });
            return editThread({
              id: editedThread.id,
              message,
              title,
              files: uploads,
            }).then(() => {
              setUploads([]);
              setEditedThread(undefined);
              setEditedMessage(undefined);
            });
          }}
          progress={progress}
          uploading={uploading}
          uploads={uploads}
          uploadFiles={uploadFiles}
        />
      )}
      {currentUser && editedMessage && (
        <EditMessageModal
          api={api}
          communityId={settings.communityId}
          currentUser={currentUser}
          open={modal === ModalView.EDIT_MESSAGE}
          close={() => {
            setEditedThread(undefined);
            setEditedMessage(undefined);
            setModal(ModalView.NONE);
          }}
          onSend={({ message }) => {
            setModal(ModalView.NONE);
            return editMessage({
              id: editedMessage.id,
              body: message,
            });
          }}
          currentMessage={editedMessage}
          progress={progress}
          uploading={uploading}
          uploads={uploads}
          uploadFiles={uploadFiles}
        />
      )}
    </>
  );
}
