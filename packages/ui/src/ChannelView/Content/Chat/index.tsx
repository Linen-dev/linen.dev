import React, { createRef } from 'react';
import MessageForm from '@/MessageForm';
import { SerializedUser, UploadedFile } from '@linen/types';
import styles from './index.module.scss';

interface Props {
  communityId: string;
  channelId: string;
  currentUser?: SerializedUser | null;
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
  sendMessage({
    message,
    files,
    channelId,
  }: {
    message: string;
    files: UploadedFile[];
    channelId: string;
  }): Promise<void>;
  uploadFiles?(files: File[]): Promise<void>;
  progress: number;
  uploading: boolean;
  uploads: UploadedFile[];
  fetchMentions(term?: string): Promise<SerializedUser[]>;
  useUsersContext(): any;
}

export default function Chat({
  channelId,
  communityId,
  currentUser,
  progress,
  uploading,
  uploads,
  onDrop,
  sendMessage,
  uploadFiles,
  fetchMentions,
  useUsersContext,
}: Props) {
  const ref = createRef<HTMLDivElement>();

  function handleDragEnter() {
    const node = ref.current as HTMLElement;
    node.classList.add(styles.hover);
  }

  function handleDragLeave() {
    const node = ref.current as HTMLElement;
    node.classList.remove(styles.hover);
  }

  return (
    <div
      className={styles.chat}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={(event: React.DragEvent) => {
        if (!uploadFiles) {
          return;
        }
        event.preventDefault();
        const node = ref.current as HTMLElement;
        node.classList.remove(styles.hover);
        const files = Array.from(event.dataTransfer.files || []);
        if (files.length > 0) {
          return uploadFiles(files);
        }
        const text = event.dataTransfer.getData('text');
        if (text) {
          const data = JSON.parse(text);
          onDrop({
            source: data.source,
            target: 'channel',
            from: data.id,
            to: channelId,
          });
        }
      }}
      ref={ref}
    >
      <MessageForm
        id={`channel-message-form-${channelId}`}
        currentUser={currentUser}
        onSend={(message: string, files: UploadedFile[]) => {
          return sendMessage({
            message,
            files,
            channelId: channelId,
          });
        }}
        progress={progress}
        uploading={uploading}
        uploads={uploads}
        upload={uploadFiles}
        fetchMentions={fetchMentions}
        useUsersContext={useUsersContext}
      />
    </div>
  );
}
