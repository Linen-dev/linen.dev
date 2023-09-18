import React, { useState } from 'react';
import classNames from 'classnames';
import Line from '@/Line';
import {
  Permissions,
  Priority,
  ReminderTypes,
  SerializedAccount,
  SerializedChannel,
  SerializedReadStatus,
  SerializedThread,
  SerializedTopic,
  SerializedUser,
  Settings,
} from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import usePriority from '@linen/hooks/priority';
import styles from './index.module.scss';
import DefaultRow from '@/Row';
import ImagePreview from '@/ImagePreview';
import { getImageUrls } from './utilities/threads';
import { groupByThread, toRows, TopicRow } from './utilities/topics';

enum RowType {
  Topic,
  ReadStatus,
}

interface RowItem {
  type: RowType;
  content: SerializedThread | SerializedReadStatus;
  topic: SerializedTopic;
  timestamp: number;
  first?: boolean;
  last?: boolean;
  padded?: boolean;
  avatar?: boolean;
  hash?: string;
}

export default function Grid({
  className,
  currentChannel,
  currentCommunity,
  threads,
  topics,
  permissions,
  readStatus,
  isSubDomainRouting,
  currentThreadId,
  settings,
  isBot,
  currentUser,
  mode,
  onClick,
  onDelete,
  onDrop,
  onEdit,
  onLoad,
  onMute,
  onUnmute,
  onPin,
  onStar,
  onReaction,
  onRead,
  onRemind,
  onUnread,
  Row = DefaultRow,
  activeUsers,
}: {
  className?: string;
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  threads: SerializedThread[];
  topics: SerializedTopic[];
  permissions: Permissions;
  readStatus?: SerializedReadStatus;
  isSubDomainRouting: boolean;
  currentThreadId?: string;
  settings: Settings;
  isBot: boolean;
  currentUser: SerializedUser | null;
  mode?: Mode;
  onClick: (threadId: string) => void;
  onDelete: (messageId: string) => void;
  onEdit?: (threadId: string) => void;
  onMute?: (threadId: string) => void;
  onUnmute?: (threadId: string) => void;
  onPin: (threadId: string) => void;
  onStar: (threadId: string) => void;
  onReaction({
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
  onDrop?({
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
  onRead?(threadId: string): void;
  onRemind?(threaId: string, reminder: ReminderTypes): void;
  onUnread?(threadId: string): void;
  onLoad?(): void;
  Row?: typeof DefaultRow;
  activeUsers: string[];
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const images = getImageUrls(threads);
  const topicRows = toRows(
    groupByThread(
      topics.sort((a, b) => {
        return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
      })
    )
  );
  const rows = [
    readStatus &&
      !readStatus.read && {
        type: RowType.ReadStatus,
        content: readStatus,
        timestamp: Number(readStatus.lastReadAt),
      },
    ...topicRows
      // .filter((thread) => thread.messages.length > 0)
      .map((topic) => {
        const thread = threads.find(({ id }) => id === topic.threadId);
        return {
          type: RowType.Topic,
          content: thread,
          topic,
          timestamp: new Date(topic.sentAt),
          first: topic.first,
          last: topic.last,
          padded: topic.padded,
          avatar: topic.avatar,
          hash: topic.hash,
        };
      })
      .filter((topic) => !!topic.content),
  ].filter(Boolean) as RowItem[];

  const sorted = rows.sort((a, b) => {
    return a.timestamp - b.timestamp;
  });
  const { priority } = usePriority();

  function onImageClick(src: string) {
    setPreview(src);
  }

  return (
    <div
      className={classNames(className, {
        [styles.mouse]: priority === Priority.MOUSE,
      })}
    >
      {sorted.map((item, index) => {
        const previous = sorted[index - 1];
        const last = index === sorted.length - 1;
        if (item.type === RowType.ReadStatus && !last) {
          return (
            <li key={`inbox-line-${index}`}>
              <Line className={styles.line}>New</Line>
            </li>
          );
        } else if (item.type === RowType.Topic) {
          const thread = item.content as SerializedThread;
          const { incrementId, slug, id } = thread;
          return (
            <li
              key={`channel-grid-item-${item.topic.messageId}`}
              className={classNames(styles.li, {
                [styles.active]: thread.id === currentThreadId,
                [styles.padded]: !item.first && item.padded,
                [styles.divider]: previous && item.hash !== previous.hash,
              })}
            >
              <Row
                // incrementId={incrementId}
                // slug={slug}
                className={classNames({
                  [styles.avatar]: item.avatar,
                  [styles['padding-top']]: item.first,
                  [styles['padding-bottom']]: item.last,
                  [styles['padding-left']]: item.padded,
                })}
                showHeader={item.first}
                showAvatar={item.avatar}
                avatarSize={item.padded ? 'sm' : 'md'}
                showVotes={false}
                showMessages={false}
                thread={thread}
                topic={item.topic}
                permissions={permissions}
                isSubDomainRouting={isSubDomainRouting}
                settings={settings}
                currentUser={currentUser}
                currentCommunity={currentCommunity}
                mode={mode}
                onClick={() => onClick(id)}
                onDelete={onDelete}
                onEdit={onEdit}
                onDrop={onDrop}
                onMute={onMute}
                onUnmute={onUnmute}
                onPin={onPin}
                onStar={onStar}
                onReaction={onReaction}
                onRead={onRead}
                onRemind={onRemind}
                onUnread={onUnread}
                onLoad={onLoad}
                onImageClick={onImageClick}
                activeUsers={activeUsers}
              />
            </li>
          );
        }
      })}
      {preview && (
        <ImagePreview
          current={preview}
          images={images}
          onClick={() => setPreview(null)}
        />
      )}
    </div>
  );
}
