import React from 'react';
import classNames from 'classnames';
import Line from '@/Line';
import {
  Permissions,
  Priority,
  ReminderTypes,
  SerializedReadStatus,
  SerializedThread,
  SerializedUser,
  Settings,
} from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import usePriority from '@linen/hooks/priority';
import styles from './index.module.scss';
import DefaultRow from '@/ChannelView/Content/Row';

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
  Actions,
  Row = DefaultRow,
}: {
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
  Actions(): JSX.Element;
  Row?(...args: any): JSX.Element;
}) {
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
    return a.timestamp - b.timestamp;
  });
  const { priority } = usePriority();

  return (
    <div
      className={classNames({ [styles.mouse]: priority === Priority.MOUSE })}
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
                {...{
                  incrementId,
                  slug,
                }}
                Actions={Actions}
                className={styles.row}
                thread={thread}
                permissions={permissions}
                isSubDomainRouting={isSubDomainRouting}
                settings={settings}
                currentUser={currentUser}
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
              />
            </li>
          );
        }
      })}
    </div>
  );
}
