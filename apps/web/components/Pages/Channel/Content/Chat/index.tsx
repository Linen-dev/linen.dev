import React, { createRef, useState } from 'react';
import MessageForm from 'components/MessageForm';
import { fetchMentions, upload } from 'components/MessageForm/api';
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
}

export default function Chat({
  channelId,
  communityId,
  currentUser,
  onDrop,
  sendMessage,
}: Props) {
  const ref = createRef<HTMLDivElement>();
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

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
        event.preventDefault()
        const node = ref.current as HTMLElement;
        node.classList.remove(styles.hover);
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
        id="channel-message-form"
        currentUser={currentUser}
        onSend={(message: string, files: UploadedFile[]) => {
          return sendMessage({
            message,
            files,
            channelId: channelId,
          });
        }}
        fetchMentions={(term?: string) => {
          if (!term) return Promise.resolve([]);
          return fetchMentions(term, communityId);
        }}
        progress={progress}
        uploading={uploading}
        upload={(data) => {
          setProgress(0);
          setUploading(true)
          return upload({ communityId, data }, {
            onUploadProgress: (progressEvent: ProgressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            },
          }).then((response) => {
            setUploading(false)
            return response
          }).catch((response) => {
            setUploading(false)
            return response
          })
        }}
      />
    </div>
  );
}
