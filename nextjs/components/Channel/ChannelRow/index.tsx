import DraggableRow from 'components/Channel/ChannelRow/DraggableRow';
import Avatars from '../../Avatars';
import { users } from '@prisma/client';
import type { Settings } from 'serializers/account/settings';
import Row from 'components/Message/Row';
import styles from './index.module.scss';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import { Permissions } from 'types/shared';
import { Mode } from 'hooks/mode';

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
  mode,
  onPin,
  onReaction,
  onDrop,
}: {
  thread: SerializedThread;
  permissions: Permissions;
  isSubDomainRouting: boolean;
  settings: Settings;
  currentUser: SerializedUser | null;
  mode?: Mode;
  onPin?(threadId: string): void;
  onReaction?({
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
  onDrop?({ from, to }: { from: string; to: string }): void;
}) {
  const { messages } = thread;
  let users = messages.map((m) => m.author).filter(Boolean) as users[];
  const authors = uniqueUsers(users);
  const oldestMessage = messages[0];

  return (
    <DraggableRow
      id={thread.id}
      className={styles.container}
      draggable={permissions.manage}
      overClassName={styles.over}
      onDrop={onDrop}
      mode={mode}
    >
      <div className={styles.content}>
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
                      text: a.displayName,
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
    </DraggableRow>
  );
}
