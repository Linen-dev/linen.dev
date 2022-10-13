import Avatars from '../../Avatars';
import { users } from '@prisma/client';
import { getThreadUrl } from '../../Pages/ChannelsPage/utilities/url';
import type { Settings } from 'serializers/account/settings';
import Row from 'components/Message/Row';
import styles from './index.module.scss';
import { GoPin } from 'react-icons/go';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { SerializedThread } from 'serializers/thread';
import { copyToClipboard } from 'utilities/clipboard';
import { toast } from 'components/Toast';
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
}: {
  thread: SerializedThread;
  permissions: Permissions;
  isSubDomainRouting: boolean;
  settings: Settings;
  onPin(threadId: string): void;
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
      <ul className={styles.options}>
        <li
          onClick={(event) => {
            const text = getThreadUrl({
              isSubDomainRouting,
              settings,
              incrementId,
              slug,
            });
            event.stopPropagation();
            event.preventDefault();
            copyToClipboard(text);
            toast.success('Copied to clipboard', text);
          }}
        >
          <AiOutlinePaperClip />
        </li>
        {permissions.manage && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onPin(thread.id);
            }}
          >
            <GoPin className={thread.pinned ? styles.pinned : ''} />
          </li>
        )}
      </ul>
    </div>
  );
}
