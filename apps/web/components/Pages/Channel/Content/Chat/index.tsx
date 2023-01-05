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
  const [uploads, setUploads] = useState<UploadedFile[]>([]);

  function handleDragEnter() {
    const node = ref.current as HTMLElement;
    node.classList.add(styles.hover);
  }

  function handleDragLeave() {
    const node = ref.current as HTMLElement;
    node.classList.remove(styles.hover);
  }

  function uploadFiles (files: File[]) {
    setProgress(0);
    setUploading(true)
    setUploads([])
    const data = new FormData();
    files.forEach((file, index) => {
      data.append(`file-${index}`, file, file.name);
    })
    return upload({ communityId, data }, {
      onUploadProgress: (progressEvent: ProgressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      },
    }).then((response) => {
      setUploading(false)
      const { files } = response.data;
      setUploads(files);
      return response
    }).catch((response) => {
      setUploading(false)
      setUploads([])
      return response
    })
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
        const files = Array.from(event.dataTransfer.files || [])
        if (files.length > 0) {
          return uploadFiles(files)
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
        id="channel-message-form"
        currentUser={currentUser}
        onSend={(message: string, files: UploadedFile[]) => {
          return sendMessage({
            message,
            files,
            channelId: channelId,
          }).then(() => {
            setUploads([])
          })
        }}
        fetchMentions={(term?: string) => {
          if (!term) return Promise.resolve([]);
          return fetchMentions(term, communityId);
        }}
        progress={progress}
        uploading={uploading}
        uploads={uploads}
        upload={uploadFiles}
      />
    </div>
  );
}
