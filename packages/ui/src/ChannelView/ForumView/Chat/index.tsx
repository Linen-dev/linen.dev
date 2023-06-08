import React, { createRef, useState } from 'react';
import MessageForm from '@/MessageForm';
import TextInput from '@/TextInput';
import Field from '@/Field';
import { SerializedUser, UploadedFile } from '@linen/types';
import styles from './index.module.scss';

interface Props {
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
    title,
  }: {
    message: string;
    files: UploadedFile[];
    channelId: string;
    title: string;
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
  const [title, setTitle] = useState('');
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
          try {
            const data = JSON.parse(text);
            onDrop({
              source: data.source,
              target: 'channel',
              from: data.id,
              to: channelId,
            });
          } catch (exception) {
            return false;
          }
        }
      }}
      ref={ref}
    >
      <Field>
        <TextInput
          id="channel-title"
          placeholder="Add your title..."
          value={title}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(event.target.value)
          }
          onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => {
            event.stopPropagation();
            event.preventDefault();
          }}
        />
      </Field>
      <Field>
        <MessageForm
          id={`channel-message-form-${channelId}`}
          currentUser={currentUser}
          onSend={(message: string, files: UploadedFile[]) => {
            setTitle('');
            return sendMessage({
              message,
              title,
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
      </Field>
    </div>
  );
}
