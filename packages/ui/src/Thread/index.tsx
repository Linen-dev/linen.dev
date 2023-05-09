import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Header from './Header';
import Summary from './Summary';
import Messages from './Messages';
import MessageForm from '@/MessageForm';
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
import { CustomLinkHelper } from '@linen/utilities/custom-link';
import PoweredByLinen from '@/PoweredByLinen';
import EditMessageModal from '@/EditMessageModal';
import type { ApiClient } from '@linen/api-client';

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
  onEdit?(threadId: string, messageId: string): void;
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
  editMessage?({ id, body }: { id: string; body: string }): Promise<void>;
  Actions(args: any): JSX.Element;
  JoinChannelLink(args: any): JSX.Element;
  useUsersContext(): any;
  fetchMentions(term?: string | undefined): Promise<SerializedUser[]>;
  api: ApiClient;
}

enum ModalView {
  NONE,
  EDIT_MESSAGE_MODAL,
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
  editMessage,
  Actions,
  JoinChannelLink,
  useUsersContext,
  api,
  fetchMentions,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const { id, state, viewCount, incrementId } = thread;
  const [modal, setModal] = useState<ModalView>(ModalView.NONE);
  const [editedMessage, setEditedMessage] = useState<SerializedMessage>();

  const handleScroll = () =>
    setTimeout(() => scrollToBottom(ref.current as HTMLDivElement), 0);

  useEffect(() => {
    onMount?.();
  }, []);

  useEffect(() => {
    if (incrementId) {
      api.put(`/api/count?incrementId=${incrementId}`);
      if (currentUser?.id) {
        api.put('/api/notifications/mark', { threadId: thread.id });
      }
    }
  }, []);

  function showEditMessageModal(threadId: string, messageId: string) {
    const message = thread.messages.find(
      ({ id }: SerializedMessage) => id === messageId
    );
    setEditedMessage(message);
    setModal(ModalView.EDIT_MESSAGE_MODAL);
  }

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
    return api
      .upload(
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
      .then(({ files }) => {
        setUploading(false);
        setUploads(files);
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
    <>
      <div
        className={classNames(styles.container, {
          [styles.expanded]: expanded,
        })}
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
            onEdit={editMessage ? showEditMessageModal : undefined}
            onReaction={onReaction}
            onLoad={handleScroll}
            onResolution={onResolution}
          />

          <div className={styles.info}>
            <div className={styles.count}>
              <span className={styles.badge}>
                {views > 1 && (
                  <div className={styles.count}>
                    {views} {views === 1 ? 'View' : 'Views'}
                  </div>
                )}
              </span>
            </div>
          </div>
          <div className={styles.info}>
            {threadUrl && (
              <>
                {ChannelButton({ thread, isSubDomainRouting, settings })}
                <JoinChannelLink
                  className={styles.link}
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
                progress={progress}
                uploading={uploading}
                uploads={uploads}
                upload={uploadFiles}
                {...{
                  useUsersContext,
                  fetchMentions,
                }}
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
                progress={progress}
                uploading={uploading}
                uploads={uploads}
                upload={uploadFiles}
                {...{
                  useUsersContext,
                  fetchMentions,
                }}
              />
            )}
          </div>
        )}
        {expanded && !currentUser && (
          <div className={styles.footer}>
            <PoweredByLinen />
          </div>
        )}
      </div>
      {currentUser && editMessage && editedMessage && (
        <EditMessageModal
          communityId={settings.communityId}
          currentUser={currentUser}
          open={modal === ModalView.EDIT_MESSAGE_MODAL}
          close={() => {
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
        <a href={CustomLinkHelper(channelLink)} className={styles.link}>
          #{thread.channel?.channelName}
        </a>
      )}
    </>
  );
}
