import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Header from './Header';
import Messages from './Messages';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import MessageForm from 'components/MessageForm';
import { fetchMentions, upload } from 'components/MessageForm/api';
import {
  Permissions,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  Settings,
  ThreadState,
  UploadedFile,
} from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import useThreadWebsockets from '@linen/hooks/websockets/thread';
import { scrollToBottom } from '@linen/utilities/scroll';
import styles from './index.module.scss';
import { put } from 'utilities/requests';

interface Props {
  thread: SerializedThread;
  channelId: string;
  channelName: string;
  threadUrl?: string | null;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
  currentUser: SerializedUser | null;
  mode?: Mode;
  token: string | null;
  sendMessage({
    message,
    files,
    channelId,
    threadId,
  }: {
    message: string;
    files: UploadedFile[];
    channelId: string;
    threadId: string;
  }): Promise<void>;
  updateThread({ state, title }: { state?: ThreadState; title?: string }): void;
  onClose?(): void;
  onSend?(): void;
  onMessage(
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ): void;
  onMount?(): void;
  onReaction?({
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
}

export default function Thread({
  thread,
  channelId,
  channelName,
  threadUrl,
  isSubDomainRouting,
  settings,
  permissions,
  currentUser,
  mode,
  token,
  sendMessage,
  updateThread,
  onClose,
  onSend,
  onMount,
  onReaction,
  onMessage,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0)
  const { id, state, viewCount, incrementId } = thread;

  const handleScroll = () =>
    setTimeout(() => scrollToBottom(ref.current as HTMLDivElement), 0);

  useEffect(() => {
    onMount?.();
  }, []);

  useEffect(() => {
    put(`/api/count?incrementId=${incrementId}`);
    if (currentUser?.id) {
      put('/api/notifications/mark', { threadId: thread.id });
    }
  }, []);

  useThreadWebsockets({
    id: thread?.id,
    token,
    permissions,
    onMessage(message, messageId, imitationId) {
      onMessage(message, messageId, imitationId);
      handleScroll();
    },
  });

  function isThreadCreator(
    currentUser: SerializedUser | null,
    thread: SerializedThread
  ): boolean {
    const creator = thread.messages[0].author;
    if (!currentUser || !creator) {
      return false;
    }
    return currentUser.id === creator.id;
  }

  const uploadFiles = (data: FormData) => {
    setProgress(0);
    return upload(
      { communityId: settings.communityId, data }, {
        onUploadProgress: (progressEvent: ProgressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      }
    );
  }

  const manage = permissions.manage || isThreadCreator(currentUser, thread);

  useEffect(() => {
    permissions.chat && handleScroll();
  }, []);

  return (
    <div className={classNames(styles.container)} ref={ref}>
      <Header
        thread={thread}
        channelName={channelName}
        onClose={onClose}
        onCloseThread={() => updateThread({ state: ThreadState.CLOSE })}
        onReopenThread={() => updateThread({ state: ThreadState.OPEN })}
        onSetTitle={(title) => updateThread({ title })}
        manage={manage}
      />
      <div className={styles.thread}>
        <Messages
          thread={thread}
          permissions={permissions}
          isSubDomainRouting={isSubDomainRouting}
          currentUser={currentUser}
          settings={settings}
          onReaction={onReaction}
          onLoad={handleScroll}
        />

        <div className={styles.footer}>
          <div className={styles.count}>
            <span className={styles.subtext}>View count: {viewCount + 1}</span>
          </div>
          {threadUrl && (
            <JoinChannelLink
              href={threadUrl}
              communityType={settings.communityType}
            />
          )}
        </div>
      </div>
      {permissions.chat && (
        <div className={styles.chat}>
          {manage && state === ThreadState.OPEN ? (
            <MessageForm
              autoFocus
              id="thread-message-form"
              currentUser={currentUser}
              onSend={(message: string, files: UploadedFile[]) => {
                onSend?.();
                const promise = sendMessage({
                  message,
                  files,
                  channelId,
                  threadId: id,
                });
                handleScroll();
                return promise;
              }}
              onSendAndClose={(message: string, files: UploadedFile[]) => {
                onSend?.();
                handleScroll();
                return Promise.all([
                  sendMessage({ message, files, channelId, threadId: id }),
                  updateThread({ state: ThreadState.CLOSE }),
                ]);
              }}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return fetchMentions(term, settings.communityId);
              }}
              progress={progress}
              upload={uploadFiles}
            />
          ) : (
            <MessageForm
              autoFocus
              id="thread-message-form"
              currentUser={currentUser}
              onSend={(message: string, files: UploadedFile[]) => {
                onSend?.();
                const promise = sendMessage({
                  message,
                  files,
                  channelId,
                  threadId: id,
                });
                handleScroll();
                return promise;
              }}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return fetchMentions(term, settings.communityId);
              }}
              progress={progress}
              upload={uploadFiles}
            />
          )}
        </div>
      )}
    </div>
  );
}
