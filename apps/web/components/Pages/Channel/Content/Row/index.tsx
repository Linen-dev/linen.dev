import Droppable from './Droppable';
import { Avatars } from '@linen/ui';
import Image from 'next/image';
import GridRow from 'components/GridRow';
import styles from './index.module.scss';
import { SerializedThread } from '@linen/types';
import { SerializedUser } from '@linen/types';
import { Permissions, Settings } from '@linen/types';
import { Mode } from '@linen/hooks/mode';

export const uniqueUsers = (users: SerializedUser[]): SerializedUser[] => {
  let userMap = new Map<string, SerializedUser>();

  users.forEach((user) => {
    userMap.set(user.id, user);
  });

  return Array.from(userMap.values());
};

export default function ChannelRow({
  className,
  thread,
  permissions,
  isSubDomainRouting,
  settings,
  currentUser,
  mode,
  onPin,
  onReaction,
  onDrop,
  onLoad,
}: {
  className?: string;
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
  const { messages } = thread;
  const message = messages[0];
  let users = messages.map((m) => m.author).filter(Boolean) as SerializedUser[];
  const authors = uniqueUsers(users);
  const avatars = authors
    .filter((user) => user.id !== message.author?.id)
    .map((a) => ({
      src: a.profileImageUrl,
      text: a.displayName,
    }));

  return (
    <Droppable id={thread.id} className={styles.container} onDrop={onDrop}>
      <div className={styles.content}>
        <GridRow
          className={className}
          thread={thread}
          message={message}
          isSubDomainRouting={isSubDomainRouting}
          settings={settings}
          permissions={permissions}
          currentUser={currentUser}
          mode={mode}
          drag="thread"
          onPin={onPin}
          onReaction={onReaction}
          onLoad={onLoad}
          header={
            thread.title && <div className={styles.header}>{thread.title}</div>
          }
          footer={
            messages.length > 1 && (
              <div className={styles.footer}>
                <Avatars size="sm" users={avatars} Image={Image} />
                <>
                  {messages.length - 1}{' '}
                  {messages.length > 2 ? 'replies' : 'reply'} &middot;{' '}
                  {`${authors.length} participant${
                    authors.length > 1 ? 's' : ''
                  }`}
                </>
              </div>
            )
          }
        />
      </div>
    </Droppable>
  );
}
