import Avatar from '../../Avatar';
import Avatars from '../../Avatars';
import { format } from 'timeago.js';
import Message from '../../Message';
import { users } from '@prisma/client';
import CustomLink from '../../Link/CustomLink';
import { getThreadUrl } from './utilities/url';
import { SerializedThread } from '../../../serializers/thread';
import CopyToClipboardIcon from './CopyToClipboardIcon';
import { uniqueUsers } from './Channel';

// A feed is a collection of threads
// A channel feed is a collection of threads of a single channel
// A shared inbox is a collection of threads from multiple channels
export function feedBuilder({
  threads,
  isSubDomainRouting,
  communityName,
  communityType,
}: {
  threads?: SerializedThread[];
  isSubDomainRouting: boolean;
  communityName: string;
  communityType: string;
}) {
  return threads?.map(
    ({ messages, incrementId, slug, viewCount }: SerializedThread) => {
      const oldestMessage = messages[messages.length - 1];

      const author = oldestMessage?.author;
      //don't include the original poster for the thread in replies
      let users = messages.map((m) => m.author).filter(Boolean) as users[];
      const authors = uniqueUsers(users.slice(0, -1));

      return (
        <li
          key={incrementId}
          className="px-4 py-4 hover:bg-gray-50 border-solid border-gray-200 cursor-pointer"
        >
          <CustomLink
            isSubDomainRouting={isSubDomainRouting}
            communityName={communityName}
            communityType={communityType}
            path={`/t/${incrementId}/${slug || 'topic'}`.toLowerCase()}
            key={`${incrementId}-desktop`}
          >
            <div className="flex">
              <div className="flex pr-4">
                {author && (
                  <Avatar
                    key={`${incrementId}-${
                      author.id || author.displayName
                    }-avatar-mobile}`}
                    src={author.profileImageUrl || ''} // set placeholder with a U sign
                    alt={author.displayName || ''} // Set placeholder of a slack user if missing
                    text={(author.displayName || '?').slice(0, 1).toLowerCase()}
                  />
                )}
              </div>
              <div className="flex flex-col w-full">
                <div className="flex flex-row justify-between pb-2">
                  <p className="font-semibold text-sm inline-block">
                    {author?.displayName || 'user'}
                  </p>
                  <div className="text-sm text-gray-400">
                    {format(new Date(oldestMessage?.sentAt))}
                  </div>
                </div>
                <div className="pb-2">
                  <Message
                    text={oldestMessage?.body || ''}
                    mentions={oldestMessage?.mentions.map((m) => m.users)}
                    reactions={oldestMessage?.reactions}
                    attachments={oldestMessage?.attachments}
                  />
                </div>
                <div className="flex flex-row justify-between items-center pr-2">
                  <div className="text-sm text-gray-400 flex flex-row items-center">
                    <Avatars
                      users={
                        authors.map((a) => ({
                          src: a.profileImageUrl,
                          alt: a.displayName,
                          text: (a.displayName || '?')
                            .slice(0, 1)
                            .toLowerCase(),
                        })) || []
                      }
                    />
                    {messages.length > 1 && (
                      //Kam: Not sure about this blue but I wanted to add some color to make the page more interesting
                      <div className="pl-2 text-blue-800">
                        {messages.length - 1} replies
                      </div>
                    )}
                    {/* <div className="pl-2">{viewCount} Views</div> */}
                  </div>
                  {messages.length > 1 && (
                    <CopyToClipboardIcon
                      getText={() =>
                        getThreadUrl({
                          isSubDomainRouting,
                          communityName,
                          communityType,
                          incrementId,
                          slug,
                        })
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </CustomLink>
        </li>
      );
    }
  );
}
