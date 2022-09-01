import { users } from '@prisma/client';
import CustomLink from '../Link/CustomLink';
import { SerializedThread } from '../../serializers/thread';
import { MessageCard } from '../MessageCard';
import type { Settings } from 'services/accountSettings';

// A feed is a collection of threads
// A channel feed is a collection of threads of a single channel
// A shared inbox is a collection of threads from multiple channels

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
    <div className="divide-y">
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
            const oldestMessage = messages[messages.length - 1];
            const newestMessage = messages[0];

            const author = oldestMessage?.author;
            //don't include the original poster for the thread in replies
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
                  //I could custom link conditionally render something?
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
    </div>
  );
}

export const uniqueUsers = (users: users[]): users[] => {
  let userMap = new Map<string, users>();

  users.forEach((user) => {
    userMap.set(user.id, user);
  });

  return Array.from(userMap.values());
};
