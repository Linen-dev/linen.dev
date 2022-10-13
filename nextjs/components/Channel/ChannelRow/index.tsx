import Avatars from '../../Avatars';
import { users } from '@prisma/client';
import Options from './Options';
import type { Settings } from 'serializers/account/settings';
import Row from 'components/Message/Row';
import styles from './index.module.scss';
import { SerializedThread } from 'serializers/thread';
import { Permissions } from 'types/shared';

export const uniqueUsers = (users: users[]): users[] => {
  let userMap = new Map<string, users>();

  users.forEach((user) => {
    userMap.set(user.id, user);
  });

  return Array.from(userMap.values());
};

export default function ChannelRow({
  thread,
  permissions,
  isSubDomainRouting,
  settings,
  onPin,
  onReaction,
}: {
  thread: SerializedThread;
  permissions: Permissions;
  isSubDomainRouting: boolean;
  settings: Settings;
  onPin(threadId: string): void;
  onReaction(threadId: string, reaction: string): void;
}) {
  const { incrementId, messages, state, slug } = thread;
  let users = messages.map((m) => m.author).filter(Boolean) as users[];
  const authors = uniqueUsers(users);
  const oldestMessage = messages[0];
  return (
    <div className={styles.container}>
      <Row
        message={oldestMessage}
        state={state}
        communityType={settings.communityType}
      >
        {messages.length > 1 && (
          <div className="flex flex-row items-center pt-2 pr-2">
            <div className="text-sm text-gray-400 flex flex-row items-center">
              <Avatars
                size="sm"
                users={
                  authors.map((a) => ({
                    src: a.profileImageUrl,
                    alt: a.displayName,
                    text: (a.displayName || '?').slice(0, 1).toLowerCase(),
                  })) || []
                }
              />
              <div className="px-2 text-blue-800">
                {messages.length - 1} replies
              </div>
            </div>
          </div>
        )}
      </Row>
      <Options
        thread={thread}
        isSubDomainRouting={isSubDomainRouting}
        settings={settings}
        permissions={permissions}
        className={styles.options}
        onPin={onPin}
        onReaction={onReaction}
      />
    </div>
  );
}
