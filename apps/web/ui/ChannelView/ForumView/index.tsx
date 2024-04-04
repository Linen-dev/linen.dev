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
import Empty from '../Empty';
import Grid from '@/GridContent';
import classNames from 'classnames';
import PinnedThread from '../PinnedThread';
import { createMessageWrapper } from '../utilities/createMessageWrapper';
import {
  onResolve,
  Permissions,
  ReminderTypes,
  SerializedAccount,
  SerializedChannel,
  SerializedReadStatus,
  SerializedThread,
  Settings,
  StartSignUpProps,
  ThreadState,
  UploadedFile,
} from '@linen/types';
import { SerializedMessage } from '@linen/types';
import { scrollToTop } from '@linen/utilities/scroll';
import useMode from '@linen/hooks/mode';
import styles from './index.module.scss';
import Layouts from '@/Layouts';
import { timestamp } from '@linen/utilities/date';
import debounce from '@linen/utilities/debounce';
import { getSelectedText } from '@linen/utilities/document';
import Row from '@/Row';
import ChatLayout from '@/ChatLayout';
import { getFormData } from '@linen/utilities/files';
import type { ApiClient } from '@linen/api-client';
import PaginationNumbers from '@/PaginationNumbers';
import { useViewport } from '@linen/hooks/useViewport';
import { getThreadUrl } from '@linen/utilities/url';

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
  onShare,
  onRemind,
  onSelectThread,
  updateThread,
  sendReaction,
  useUsersContext,
  usePath,
  routerPush,
  api,
  startSignUp,
  activeUsers,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isInfiniteScrollLoading, setInfiniteScrollLoading] = useState(false);
  const [isScrolling, setIsScrolling] = useState(true);
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
  const { mode } = useMode();
  const [editedMessage, setEditedMessage] = useState<SerializedMessage>();
  const [editedThread, setEditedThread] = useState<SerializedThread>();
  const [modal, setModal] = useState<ModalView>(ModalView.NONE);
  const membersPath = usePath({ href: '/members' });
  const viewport = useViewport();

  const currentUser = permissions.user || null;

  useLayoutEffect(() => {
    if (!isInfiniteScrollLoading) {
      setTimeout(() => setIsScrolling(false), 10);
      viewport === 'mobile' && NProgress.done();
    } else {
      viewport === 'mobile' && NProgress.start();
    }
  }, [viewport, isInfiniteScrollLoading]);

  async function loadMore(next: boolean = false) {
    const key = next ? 'next' : 'prev';
    if (isInfiniteScrollLoading || isScrolling) return;
    if (!cursor[key]) return;
    try {
      setInfiniteScrollLoading(true);
      if (cursor[key]) {
        const data = await api.getThreads({
          channelId: currentChannel.id,
          cursor: cursor[key] || undefined,
          accountId: currentCommunity.id,
        });
        if (data) {
          setCursor({ ...cursor, [key]: data?.nextCursor?.[key] });
          if (next) {
            setThreads((threads) => [...data.threads, ...threads]);
          } else {
            setThreads((threads) => [...threads, ...data.threads]);
          }
        }
      }
      setIsScrolling(true);
      setInfiniteScrollLoading(false);
    } catch (err) {
      setError({ ...error, [key]: err });
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
    scrollToTop(scrollableRootRef.current as HTMLElement);
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
    setCollapsed(true);
    onSelectThread(currentThread.id);
    const url = getThreadUrl({
      isSubDomainRouting,
      settings,
      incrementId: currentThread.incrementId,
      slug: currentThread.slug,
      LINEN_URL:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : 'https://www.linen.dev',
    });
    window.history.pushState(
      {
        ...window.history.state,
        options: {
          ...window.history.state.options,
          _preventNextJSReload: false,
        },
      },
      '',
      url
    );
    window.onpopstate = (event) => {
      event.preventDefault();
      window.history.pushState(
        {
          ...window.history.state,
          options: {
            ...window.history.state.options,
            _preventNextJSReload: true,
          },
        },
        '',
        window.history.state.url
      );
      setCollapsed(false);
      onSelectThread(undefined);
    };
  }

  const rootMargin =
    viewport === 'desktop' ? '640px 0px 640px 0px' : '0px 0px 0px 0px';

  const [infiniteTopRef, { rootRef: topRootRef }] = useInfiniteScroll({
    loading: isInfiniteScrollLoading || isScrolling,
    hasNextPage: !!cursor.next,
    onLoadMore: loadMoreNext,
    disabled: !!error?.next || !cursor.next || isScrolling,
    rootMargin,
    delayInMs: 0,
  });

  const [infiniteBottomRef, { rootRef: bottomRootRef }] = useInfiniteScroll({
    loading: isInfiniteScrollLoading || isScrolling,
    hasNextPage: !!cursor.prev,
    onLoadMore: loadMore,
    disabled: !!error?.prev || !cursor.prev || isScrolling,
    rootMargin,
    delayInMs: 0,
  });

  const leftRef = useCallback(
    (node: HTMLDivElement) => {
      bottomRootRef(node);
      topRootRef(node);
      scrollableRootRef.current = node;
    },
    [topRootRef, bottomRootRef]
  );

  function showEditThreadModal(threadId: string, messageId: string) {
    const thread = threads.find(({ id }) => id === threadId);
    if (thread) {
      const message = thread.messages.find(
        (message) => message.id === messageId
      );
      setEditedMessage(message);
      setEditedThread(thread);
      setModal(ModalView.EDIT_THREAD);
    }
  }

  const debouncedCreateMessage = useCallback(
    debounce(api.createMessage, 100),
    []
  );

  const sendThreadMessage = createMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    setUploads,
    setThreads,
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
            {cursor?.next && !error?.next && !isScrolling && (
              <div ref={infiniteTopRef}></div>
            )}
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
                  {pinnedThread && (
                    <PinnedThread onClick={() => selectThread(pinnedThread.id)}>
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
                          className={styles.grid}
                          currentChannel={currentChannel}
                          currentCommunity={currentCommunity}
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
                          Row={Row}
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
                  </>
                ) : (
                  <></>
                )
              }
            />
            {cursor.prev && !error?.prev && !isScrolling && (
              <div ref={infiniteBottomRef}></div>
            )}
            <div ref={leftBottomRef}></div>
          </div>
        }
        leftRef={leftRef}
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
                setCollapsed(false);
                onSelectThread(undefined);
              }}
              expanded={collapsed}
              onExpandClick={() => {
                setCollapsed(false);
                onSelectThread(undefined);
              }}
              onResolution={updateThreadResolution}
              sendMessage={sendThreadMessage}
              onDelete={deleteMessage}
              onReaction={sendReaction}
              token={token}
              onSend={() => {
                handleScroll();
              }}
              onMessage={(threadId, message, messageId, imitationId) => {
                onMessage(threadId, message, messageId, imitationId);
                // scroll by msg height?
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
    </>
  );
}
