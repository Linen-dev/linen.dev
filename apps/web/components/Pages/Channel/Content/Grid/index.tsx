import CustomLink from 'components/Link/CustomLink';
import { SerializedReadStatus, SerializedThread } from '@linen/types';
import Row from '../Row';
import { SerializedUser } from '@linen/types';
import { Permissions, Settings } from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';

enum RowType {
  Thread,
  ReadStatus
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
  settings,
  isBot,
  currentUser,
  mode,
  onClick,
  onPin,
  onReaction,
  onDrop,
  onLoad,
}: {
  threads: SerializedThread[];
  permissions: Permissions;
  readStatus: SerializedReadStatus;
  isSubDomainRouting: boolean;
  settings: Settings;
  isBot: boolean;
  currentUser: SerializedUser | null;
  mode?: Mode;
  onClick: (threadId: number) => void;
  onPin: (threadId: string) => void;
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
  onLoad?(): void;
}) {
  const rows: RowItem[] = [
    ...threads.filter((thread) => thread.messages.length > 0).map((thread) => {
      return { type: RowType.Thread, content: thread, timestamp: Number(thread.sentAt) }
    })
  ].filter(Boolean)
  return (
    <>
      {rows
        .map((item, index) => {
          const thread = item.content as SerializedThread
          const { incrementId, slug } = thread;
          return (
            <li key={`feed-${incrementId}-${index}`} className={styles.li}>
              {isBot ? (
                <>
                  <CustomLink
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
                      settings={settings}
                      currentUser={currentUser}
                    />
                  </CustomLink>
                </>
              ) : (
                <div onClick={() => onClick(incrementId)}>
                  <Row
                    className={styles.row}
                    thread={thread}
                    permissions={permissions}
                    isSubDomainRouting={isSubDomainRouting}
                    settings={settings}
                    currentUser={currentUser}
                    mode={mode}
                    onPin={onPin}
                    onReaction={onReaction}
                    onDrop={onDrop}
                    onLoad={onLoad}
                  />
                </div>
              )}
            </li>
          );
        })}
    </>
  );
}
