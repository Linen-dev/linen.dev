import Avatars from '../Avatars';
import { users } from '@prisma/client';
import { getThreadUrl } from '../Pages/ChannelsPage/utilities/url';
import { SerializedMessage } from '../../serializers/message';
import CopyToClipboardIcon from '../Pages/ChannelsPage/CopyToClipboardIcon';
import type { Settings } from 'serializers/account/settings';
import Row from 'components/Message/Row';

export const uniqueUsers = (users: users[]): users[] => {
  let userMap = new Map<string, users>();

  users.forEach((user) => {
    userMap.set(user.id, user);
  });

  return Array.from(userMap.values());
};

export function MessageCard({
  incrementId,
  messages,
  isSubDomainRouting,
  settings,
  slug,
}: {
  incrementId: number;
  messages: SerializedMessage[];
  isSubDomainRouting: boolean;
  settings: Settings;
  slug: string | null;
}) {
  let users = messages.map((m) => m.author).filter(Boolean) as users[];
  const authors = uniqueUsers(users.slice(0, -1));
  const oldestMessage = messages[0];
  return (
    <Row message={oldestMessage} communityType={settings.communityType}>
      {authors.length > 0 && (
        <div className="flex flex-row items-center pt-2 pr-2">
          <div className="text-sm text-gray-400 flex flex-row items-center">
            <Avatars
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
          <CopyToClipboardIcon
            getText={() =>
              getThreadUrl({
                isSubDomainRouting,
                settings,
                incrementId,
                slug,
              })
            }
          />
        </div>
      )}
    </Row>
  );
}
