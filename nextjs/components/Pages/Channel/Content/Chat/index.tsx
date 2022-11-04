import React, { createRef } from 'react';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
import { UploadedFile } from 'types/shared';
import styles from './index.module.scss';

interface Props {
  communityId: string;
  channelId: string;
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
  onDrop,
  sendMessage,
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
        const node = ref.current as HTMLElement;
        node.classList.remove(styles.hover);
        const text = event.dataTransfer.getData('text');
        const data = JSON.parse(text);
        onDrop({
          source: data.source,
          target: 'channel',
          from: data.id,
          to: channelId,
        });
      }}
      ref={ref}
    >
      <MessageForm
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
      />
    </div>
  );
}
