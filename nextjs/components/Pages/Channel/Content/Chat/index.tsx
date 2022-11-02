import React from 'react';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
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
    channelId,
  }: {
    message: string;
    channelId: string;
  }): Promise<void>;
}

export default function Chat({
  channelId,
  communityId,
  onDrop,
  sendMessage,
}: Props) {
  return (
    <div
      className={styles.chat}
      onDrop={(event: React.DragEvent) => {
        const text = event.dataTransfer.getData('text');
        const data = JSON.parse(text);
        onDrop({
          source: data.source,
          target: 'channel',
          from: data.id,
          to: channelId,
        });
      }}
    >
      <MessageForm
        onSend={(message: string) => {
          return sendMessage({
            message,
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
