import Avatars from '../../Avatars';
import { users } from '@prisma/client';
import type { Settings } from 'serializers/account/settings';
import Row from 'components/Message/Row';
import styles from './index.module.scss';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
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
  currentUser,
  onPin,
  onReaction,
}: {
  thread: SerializedThread;
  permissions: Permissions;
  isSubDomainRouting: boolean;
  settings: Settings;
  currentUser: SerializedUser | null;
  onPin(threadId: string): void;
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
}) {
  const { messages } = thread;
  let users = messages.map((m) => m.author).filter(Boolean) as users[];
  const authors = uniqueUsers(users);
  const oldestMessage = messages[0];
  return (
    <div className={styles.container}>
      <Row
        thread={thread}
        message={oldestMessage}
        isSubDomainRouting={isSubDomainRouting}
        settings={settings}
        permissions={permissions}
        currentUser={currentUser}
        onPin={onPin}
        onReaction={onReaction}
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
    </div>
  );
}
