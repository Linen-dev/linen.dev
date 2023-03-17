import CustomLink from 'components/Link/CustomLink';
import Row from '../Row';
import classNames from 'classnames';
import { Line } from '@linen/ui';
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

enum RowType {
  Thread,
  ReadStatus,
}

interface RowItem {
  type: RowType;
  content: SerializedThread | SerializedReadStatus;
  timestamp: number;
}

export default function Grid({
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
  onLoad,
  onMute,
  onUnmute,
  onPin,
  onStar,
  onReaction,
  onRead,
  onRemind,
  onUnread,
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
              {isBot ? (
                <RowForBots
                  {...{
                    thread,
                    isSubDomainRouting,
                    settings,
                    incrementId,
                    slug,
                    permissions,
                    currentUser,
                  }}
                />
              ) : (
                <div onClick={() => onClick(id)}>
                  <Row
                    className={styles.row}
                    thread={thread}
                    permissions={permissions}
                    isSubDomainRouting={isSubDomainRouting}
                    settings={settings}
                    currentUser={currentUser}
                    mode={mode}
                    onDelete={onDelete}
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
                </div>
              )}
            </li>
          );
        }
      })}
    </div>
  );
}

function RowForBots({
  thread,
  isSubDomainRouting,
  settings,
  incrementId,
  slug,
  permissions,
  currentUser,
}: {
  thread: SerializedThread;
  isSubDomainRouting: boolean;
  settings: Settings;
  incrementId: number;
  slug: string | null;
  permissions: Permissions;
  currentUser: SerializedUser | null;
}) {
  const WithoutLink = ({ children }: any) => <>{children}</>;

  const Wrap = thread?.messages?.length > 1 ? CustomLink : WithoutLink;

  return (
    <Wrap
      isSubDomainRouting={isSubDomainRouting}
      communityName={settings.communityName}
      communityType={settings.communityType}
      path={`/t/${incrementId}/${slug || 'topic'}`.toLowerCase()}
      key={`${incrementId}-desktop`}
    >
      <Row
        thread={thread}
        permissions={permissions}
        isSubDomainRouting={isSubDomainRouting}
        isBot={true}
        settings={settings}
        currentUser={currentUser}
      />
    </Wrap>
  );
}
