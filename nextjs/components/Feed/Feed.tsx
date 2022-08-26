import { users } from '@prisma/client';
import CustomLink from '../Link/CustomLink';
import { SerializedThread } from '../../serializers/thread';
import { uniqueUsers } from '../Pages/Channels/Channel';
import { MessageCard } from '../MessageCard';

// A feed is a collection of threads
// A channel feed is a collection of threads of a single channel
// A shared inbox is a collection of threads from multiple channels

export function Feed({
  threads,
  isSubDomainRouting,
  communityName,
  communityType,
  isBot,
  onClick,
}: {
  threads?: SerializedThread[];
  isSubDomainRouting: boolean;
  communityName: string;
  communityType: string;
  isBot: boolean;
  onClick: (threadId: number) => void;
}) {
  return (
    <div>
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
                className="px-4 py-4 hover:bg-gray-50 border-solid border-gray-200 cursor-pointer"
              >
                {isBot ? (
                  //I could custom link conditionally render something?
                  <CustomLink
                    isSubDomainRouting={isSubDomainRouting}
                    communityName={communityName}
                    communityType={communityType}
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
                      communityName={communityName}
                      communityType={communityType}
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
                      communityName={communityName}
                      communityType={communityType}
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
