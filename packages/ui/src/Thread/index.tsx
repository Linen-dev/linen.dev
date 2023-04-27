import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Header from './Header';
import Summary from './Summary';
import Messages from './Messages';
import MessageForm from '@/MessageForm';
// import JoinChannelLink from 'components/Link/JoinChannelLink';
// import { fetchMentions, upload } from 'utilities/requests';
import {
  onResolve,
  Permissions,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  Settings,
  ThreadState,
  UploadedFile,
} from '@linen/types';
import useThreadWebsockets from '@linen/hooks/websockets-thread';
import { scrollToBottom } from '@linen/utilities/scroll';
import styles from './index.module.scss';
// import { put } from 'utilities/requests';
import { CustomLinkHelper } from '@linen/utilities/custom-link';

interface Props {
  thread: SerializedThread;
  channelId: string;
  channelName: string;
  threadUrl?: string | null;
  isBot?: boolean;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
  currentUser: SerializedUser | null;
  token: string | null;
  expanded?: boolean;
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
  onExpandClick?(): void;
  onDelete?(messageId: string): void;
  onSend?(): void;
  onMessage(
    threadId: string,
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
  onResolution?: onResolve;
  upload(
    {
      communityId,
      data,
    }: {
      communityId: string;
      data: FormData;
    },
    options: any
  ): Promise<any>;
  fetchMentions(term: string, communityId: string): any;
  put: (path: string, data?: {}) => Promise<any>;
  Actions(args: any): JSX.Element;
  JoinChannelLink(args: any): JSX.Element;
}

export default function Thread({
  thread,
  channelId,
  channelName,
  threadUrl,
  isBot,
  isSubDomainRouting,
  settings,
  permissions,
  currentUser,
  token,
  expanded,
  sendMessage,
  updateThread,
  onClose,
  onExpandClick,
  onDelete,
  onSend,
  onMount,
  onReaction,
  onMessage,
  onResolution,
  fetchMentions,
  put,
  upload,
  Actions,
  JoinChannelLink,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const { id, state, viewCount, incrementId } = thread;

  const handleScroll = () =>
    setTimeout(() => scrollToBottom(ref.current as HTMLDivElement), 0);

  useEffect(() => {
    onMount?.();
  }, []);

  useEffect(() => {
    if (incrementId) {
      put(`/api/count?incrementId=${incrementId}`);
      if (currentUser?.id) {
        put('/api/notifications/mark', { threadId: thread.id });
      }
    }
  }, []);

  useThreadWebsockets({
    id: thread.id,
    token,
    permissions,
    onMessage(message, messageId, imitationId) {
      onMessage(thread.id, message, messageId, imitationId);
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

  const uploadFiles = (files: File[]) => {
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
        return response;
      });
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const manage = permissions.manage || isThreadCreator(currentUser, thread);

  useEffect(() => {
    permissions.chat && handleScroll();
  }, []);

  const views = viewCount + 1;

  return (
    <div
      className={classNames(styles.container, { [styles.expanded]: expanded })}
      ref={ref}
      onDrop={onDrop}
    >
      <Header
        thread={thread}
        channelName={channelName}
        onClose={onClose}
        onCloseThread={() => updateThread({ state: ThreadState.CLOSE })}
        expanded={expanded}
        onExpandClick={onExpandClick}
        onReopenThread={() => updateThread({ state: ThreadState.OPEN })}
        onSetTitle={(title) => updateThread({ title })}
        manage={manage}
      />{' '}
      <Summary thread={thread} />
      <div className={styles.thread}>
        <Messages
          {...{ Actions }}
          thread={thread}
          permissions={permissions}
          isBot={isBot}
          isSubDomainRouting={isSubDomainRouting}
          currentUser={currentUser}
          settings={settings}
          onDelete={onDelete}
          onReaction={onReaction}
          onLoad={handleScroll}
          onResolution={onResolution}
        />

        <div className={styles.footer}>
          <div className={styles.count}>
            <span className={styles.badge}>
              {!currentUser && (
                <a className={styles.text} href="https://linen.dev">
                  Powered by Linen
                </a>
              )}
              {views > 1 && (
                <div className={styles.count}>
                  Viewed {views} {views === 1 ? 'time' : 'times'}
                </div>
              )}
            </span>
          </div>
          {threadUrl && (
            <>
              {ChannelButton({ thread, isSubDomainRouting, settings })}
              <JoinChannelLink
                href={threadUrl}
                communityType={settings.communityType}
              />
            </>
          )}
        </div>
      </div>
      {permissions.chat && (
        <div className={styles.chat}>
          {manage && state === ThreadState.OPEN ? (
            <MessageForm
              id={`thread-message-form-${thread.id}`}
              currentUser={currentUser}
              onSend={(message: string, files: UploadedFile[]) => {
                onSend?.();
                const promise = sendMessage({
                  message,
                  files,
                  channelId,
                  threadId: id,
                }).then(() => {
                  setUploads([]);
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
                ]).then(() => {
                  setUploads([]);
                });
              }}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return fetchMentions(term, settings.communityId);
              }}
              progress={progress}
              uploading={uploading}
              uploads={uploads}
              upload={uploadFiles}
            />
          ) : (
            <MessageForm
              id={`thread-message-form-${thread.id}`}
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
              uploading={uploading}
              uploads={uploads}
              upload={uploadFiles}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ChannelButton({
  thread,
  settings,
  isSubDomainRouting,
}: {
  thread: SerializedThread;
  settings: Settings;
  isSubDomainRouting: boolean;
}) {
  const channelLink = thread.channel
    ? {
        isSubDomainRouting,
        communityName: settings.communityName,
        communityType: settings.communityType,
        path: `/c/${thread.channel.channelName}${
          thread.page ? `/${thread.page}` : ''
        }#${thread.id}`,
      }
    : null;

  return (
    <>
      {channelLink && (
        <a href={CustomLinkHelper(channelLink)} className={styles.badge}>
          <span className={styles.count}>
            Back to #{thread.channel?.channelName}
          </span>
        </a>
      )}
    </>
  );
}
