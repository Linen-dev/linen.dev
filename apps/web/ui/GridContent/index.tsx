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
  SerializedUser,
  Settings,
} from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import usePriority from '@linen/hooks/priority';
import styles from './index.module.scss';
import DefaultRow from '@/Row';
import ImagePreview from '@/ImagePreview';
import { getImageUrls } from './utilities/threads';

enum RowType {
  Thread,
  ReadStatus,
}

interface RowItem {
  type: RowType;
  content: SerializedThread | SerializedReadStatus;
  timestamp: number;
}

export default function GridContent({
  className,
  currentChannel,
  currentCommunity,
  threads,
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
  onEdit?: (threadId: string, messageId: string) => void;
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
  const rows = [
    readStatus &&
      !readStatus.read && {
        type: RowType.ReadStatus,
        content: readStatus,
        timestamp: Number(readStatus.lastReadAt),
      },
    ...threads
      .filter((thread) => thread.messages.length > 0)
      .map((thread) => {
        return {
          type: RowType.Thread,
          content: thread,
          timestamp: Number(thread.sentAt),
        };
      }),
  ].filter(Boolean) as RowItem[];

  const sorted = rows.sort((a, b) => {
    if (currentChannel.viewType === 'FORUM') {
      return b.timestamp - a.timestamp;
    }
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
        [styles.forum]: currentChannel.viewType === 'FORUM',
      })}
    >
      {sorted.map((item, index) => {
        const last = index === sorted.length - 1;
        if (item.type === RowType.ReadStatus && !last) {
          return (
            <li key={`inbox-line`}>
              <Line className={styles.line}>New</Line>
            </li>
          );
        } else if (item.type === RowType.Thread) {
          const thread = item.content as SerializedThread;
          const { incrementId, slug, id } = thread;
          return (
            <li
              key={`channel-grid-item-${id}`}
              className={classNames(styles.li, {
                [styles.active]: thread.id === currentThreadId,
              })}
            >
              <Row
                // incrementId={incrementId}
                // slug={slug}
                className={styles.row}
                thread={thread}
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
