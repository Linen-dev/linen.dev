import CustomLink from 'components/Link/CustomLink';
import { SerializedThread } from '@linen/types';
import Row from '../Row';
import { SerializedUser } from '@linen/types';
import { Permissions, Settings } from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';

export default function Grid({
  threads,
  permissions,
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
  return (
    <>
      {threads
        .filter((thread) => thread.messages.length > 0)
        .map((thread, index) => {
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
