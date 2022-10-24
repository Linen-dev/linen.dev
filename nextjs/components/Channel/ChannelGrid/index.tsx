import CustomLink from '../../Link/CustomLink';
import { SerializedThread } from '../../../serializers/thread';
import ChannelRow from '../ChannelRow';
import type { Settings } from 'serializers/account/settings';
import { SerializedUser } from 'serializers/user';
import { Permissions } from 'types/shared';
import styles from './index.module.scss';

export default function ChannelGrid({
  threads,
  permissions,
  isSubDomainRouting,
  settings,
  isBot,
  currentUser,
  onClick,
  onPin,
  onReaction,
  onMerge,
  onDrop,
}: {
  threads: SerializedThread[];
  permissions: Permissions;
  isSubDomainRouting: boolean;
  settings: Settings;
  isBot: boolean;
  currentUser: SerializedUser | null;
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
  onMerge?(threadId: string): void;
  onDrop?({ from, to }: { from: string; to: string }): void;
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
                    <ChannelRow
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
                  <ChannelRow
                    thread={thread}
                    permissions={permissions}
                    isSubDomainRouting={isSubDomainRouting}
                    settings={settings}
                    currentUser={currentUser}
                    onPin={onPin}
                    onReaction={onReaction}
                    onMerge={index > 0 ? onMerge : undefined}
                    onDrop={onDrop}
                  />
                </div>
              )}
            </li>
          );
        })}
    </>
  );
}
