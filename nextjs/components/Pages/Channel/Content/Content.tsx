import { useCallback, useEffect, useRef, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { Thread } from 'components/Thread';
import ChannelGrid from 'components/Pages/Channel/Content/ChannelGrid';
import { get } from 'utilities/http';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
import { ThreadState } from '@prisma/client';
import { useUsersContext } from 'contexts/Users';
import ChatLayout from 'components/layout/shared/ChatLayout';
import SidebarLayout from 'components/layout/shared/SidebarLayout';
import Header from './Header';
import Empty from './Empty';
import classNames from 'classnames';
import PinnedThread from './PinnedThread';
import ChannelRow from './ChannelRow';
import { useJoinContext } from 'contexts/Join';
import { sendThreadMessageWrapper } from './sendThreadMessageWrapper';
import { sendMessageWrapper } from './sendMessageWrapper';
import type { ChannelSerialized } from 'lib/channel';
import { SerializedAccount } from 'serializers/account';
import { Settings } from 'serializers/account/settings';
import { SerializedThread } from 'serializers/thread';
import { Permissions } from 'types/shared';
import {
  scrollToBottom,
  isScrollAtBottom,
  isInViewport,
} from 'utilities/scroll';
import useMode from 'hooks/mode';
import styles from './index.module.css';

interface Props {
  settings: Settings;
  channelName: string;
  channels?: ChannelSerialized[];
  currentChannel: ChannelSerialized;
  currentCommunity: SerializedAccount | null;
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
  setThreads: React.Dispatch<React.SetStateAction<SerializedThread[]>>;
  pinThread(threadId: string): void;
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
  onSelectThread(thread: SerializedThread): void;
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
  pathCursor,
  isBot,
  permissions,
  currentThreadId,
  setThreads,
  pinThread,
  onDrop,
  sendReaction,
  onSelectThread,
  updateThread,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftBottomRef = useRef<HTMLDivElement>(null);
  const lastDistanceToBottomRef = useRef<number>(0);
  const lastDistanceToTopRef = useRef<number>(60);
  const [lastDirection, setLastDirection] = useState<'top' | 'bottom'>();
  const [cursor, setCursor] = useState(nextCursor);
  const [error, setError] = useState<{ prev?: unknown; next?: unknown }>();
  const [allUsers] = useUsersContext();
  const { startSignUp } = useJoinContext();
  const { mode } = useMode();

  const [showThread, setShowThread] = useState(false);

  const currentUser = permissions.user || null;

  function handleLeftScroll() {
    if (
      isScrollAtBottom(scrollableRootRef.current as HTMLElement) ||
      isInViewport(leftBottomRef.current as HTMLElement)
    ) {
      setTimeout(() => {
        scrollToBottom(scrollableRootRef.current as HTMLElement);
      }, 0);
    }
  }

  async function selectThread(incrementId: number) {
    const currentThread = threads.find((t) => t.incrementId === incrementId);
    if (currentThread) {
      onSelectThread(currentThread);
    }
    setShowThread(true);
    handleLeftScroll();
  }

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage: !!cursor.prev,
    onLoadMore: loadMore,
    disabled: !!error?.prev || !cursor.prev,
    rootMargin: '800px 0px 0px 0px',
  });

  const [infiniteBottomRef, { rootRef: bottomRootRef }] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage: !!cursor.next,
    onLoadMore: loadMoreNext,
    disabled: !!error?.next || !cursor.next,
    rootMargin: '0px 0px 800px 0px',
  });

  useEffect(() => {
    scrollToBottom(scrollableRootRef.current as HTMLElement);
  }, []);

  const leftRef = useCallback(
    (node: HTMLDivElement) => {
      bottomRootRef(node);
      rootRef(node);
      scrollableRootRef.current = node;
    },
    [rootRef, bottomRootRef]
  );

  const handleRootScroll = useCallback(() => {
    const rootNode = scrollableRootRef.current;
    if (rootNode) {
      const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
      lastDistanceToBottomRef.current = scrollDistanceToBottom;
      lastDistanceToTopRef.current = rootNode.scrollTop;
    }
  }, []);

  async function loadMore(next: boolean = false) {
    const key = next ? 'next' : 'prev';
    const dir = next ? 'bottom' : 'top';
    if (isLoading) return;
    if (!cursor[key]) return;
    try {
      setLastDirection(dir);
      setIsLoading(true);
      if (cursor[key]) {
        const data = await get('/api/threads', {
          channelId: currentChannel.id,
          cursor: cursor[key],
        });
        setCursor({ ...cursor, [key]: data?.nextCursor?.[key] });
        if (next) {
          setThreads([...threads, ...data.threads]);
        } else {
          setThreads([...data.threads, ...threads]);
        }
      }
      const scrollableRoot = scrollableRootRef.current;
      const lastScrollDistanceToBottom = lastDistanceToBottomRef.current;
      const lastScrollDistanceToTop = lastDistanceToTopRef.current;
      if (scrollableRoot) {
        if (pathCursor) {
          scrollableRoot.scrollTop = lastDistanceToBottomRef.current;
        } else if (lastDirection === 'top') {
          scrollableRoot.scrollTop =
            scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
        } else {
          scrollableRoot.scrollTop = lastScrollDistanceToTop;
        }
      }
    } catch (err) {
      setError({ ...error, [key]: err });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMoreNext() {
    loadMore(true);
  }

  const sendMessage = sendMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    currentChannel,
    setThreads,
    scrollableRootRef,
    currentCommunity,
    startSignUp,
  });

  const sendThreadMessage = sendThreadMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    setThreads,
    currentThreadId,
    currentCommunity,
    startSignUp,
  });

  const threadToRender = threads.find(
    (thread) => thread.id === currentThreadId
  );

  const pinnedThread = pinnedThreads[pinnedThreads.length - 1];

  return (
    <>
      <SidebarLayout
        mode={mode}
        left={
          <div
            className={classNames(styles.container, {
              [styles['has-chat']]: permissions.chat,
              [styles['is-empty']]: threads.length === 0,
            })}
          >
            {cursor?.prev && !error?.prev && <div ref={infiniteRef}></div>}
            <ChatLayout
              content={
                <>
                  <Header
                    className={classNames(styles.header, {
                      [styles.pinned]: !!pinnedThread,
                    })}
                    channelName={currentChannel.channelName}
                    mode={mode}
                  >
                    {pinnedThread && (
                      <PinnedThread
                        onClick={() => selectThread(pinnedThread.incrementId)}
                      >
                        <ChannelRow
                          thread={pinnedThread}
                          permissions={permissions}
                          isSubDomainRouting={isSubDomainRouting}
                          settings={settings}
                          currentUser={currentUser}
                          onPin={pinThread}
                          onReaction={sendReaction}
                        />
                      </PinnedThread>
                    )}
                  </Header>
                  {threads.length === 0 ? (
                    <Empty />
                  ) : (
                    <ul className="divide-y w-full">
                      <ChannelGrid
                        threads={threads}
                        permissions={permissions}
                        isSubDomainRouting={isSubDomainRouting}
                        settings={settings}
                        isBot={isBot}
                        mode={mode}
                        currentUser={currentUser}
                        onClick={selectThread}
                        onPin={pinThread}
                        onReaction={sendReaction}
                        onDrop={onDrop}
                      />
                    </ul>
                  )}
                </>
              }
              footer={
                permissions.chat && (
                  <div className={styles.chat}>
                    <MessageForm
                      onSend={(message: string) => {
                        return sendMessage({
                          message,
                          channelId: currentChannel.id,
                        });
                      }}
                      fetchMentions={(term?: string) => {
                        if (!term) return Promise.resolve([]);
                        return fetchMentions(term, settings.communityId);
                      }}
                    />
                  </div>
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
          showThread &&
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
              onClose={() => setShowThread(false)}
              sendMessage={sendThreadMessage}
              onReaction={sendReaction}
              onSend={() => {
                handleLeftScroll();
                scrollToBottom(rightRef.current as HTMLElement);
              }}
              onMount={() => {
                scrollToBottom(rightRef.current as HTMLElement);
              }}
            />
          )
        }
        rightRef={rightRef}
      />
    </>
  );
}
