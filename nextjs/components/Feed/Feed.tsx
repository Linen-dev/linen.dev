import { users } from '@prisma/client';
import CustomLink from '../Link/CustomLink';
import { SerializedThread } from '../../serializers/thread';
import { MessageCard } from '../MessageCard';
import type { Settings } from 'serializers/account/settings';

export function Feed({
  threads,
  isSubDomainRouting,
  settings,
  isBot,
  onClick,
}: {
  threads?: SerializedThread[];
  isSubDomainRouting: boolean;
  settings: Settings;
  isBot: boolean;
  onClick: (threadId: number) => void;
}) {
  return (
    <>
      {threads
        ?.filter((t) => t.messages.length > 0)
        .map(
          ({
            id,
            messages,
            incrementId,
            slug,
            viewCount,
          }: SerializedThread) => {
            const oldestMessage = messages[0];
            const newestMessage = messages[messages.length - 1];

            const author = oldestMessage?.author;
            let users = messages
              .map((m) => m.author)
              .filter(Boolean) as users[];
            const authors = uniqueUsers(users.slice(0, -1));

            return (
              <li
                key={incrementId}
                className="px-4 py-4 hover:bg-blue-50 border-solid border-gray-200 cursor-pointer w-full"
              >
                {isBot ? (
                  <CustomLink
                    isSubDomainRouting={isSubDomainRouting}
                    communityName={settings.communityName}
                    communityType={settings.communityType}
                    path={`/t/${incrementId}/${slug || 'topic'}`.toLowerCase()}
                    key={`${incrementId}-desktop`}
                  >
                    <MessageCard
                      author={author}
                      incrementId={incrementId}
                      newestMessage={newestMessage}
                      oldestMessage={oldestMessage}
                      authors={authors}
                      messages={messages}
                      isSubDomainRouting={isSubDomainRouting}
                      settings={settings}
                      slug={slug}
                    />
                  </CustomLink>
                ) : (
                  <div onClick={() => onClick(incrementId)}>
                    <MessageCard
                      author={author}
                      incrementId={incrementId}
                      newestMessage={newestMessage}
                      oldestMessage={oldestMessage}
                      authors={authors}
                      messages={messages}
                      isSubDomainRouting={isSubDomainRouting}
                      settings={settings}
                      slug={slug}
                    />
                  </div>
                )}
              </li>
            );
          }
        )}
    </>
  );
}

export const uniqueUsers = (users: users[]): users[] => {
  let userMap = new Map<string, users>();

  users.forEach((user) => {
    userMap.set(user.id, user);
  });

  return Array.from(userMap.values());
};
