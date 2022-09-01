import Avatar from '../Avatar';
import Avatars from '../Avatars';
import { format } from 'timeago.js';
import Message from '../Message';
import { users } from '@prisma/client';
import { getThreadUrl } from '../Pages/ChannelsPage/utilities/url';
import { SerializedMessage } from '../../serializers/thread';
import CopyToClipboardIcon from '../Pages/ChannelsPage/CopyToClipboardIcon';

export function MessageCard({
  author,
  incrementId,
  newestMessage,
  oldestMessage,
  authors,
  messages,
  isSubDomainRouting,
  communityName,
  communityType,
  slug,
}: {
  author: users | undefined;
  incrementId: number;
  newestMessage: SerializedMessage;
  oldestMessage: SerializedMessage;
  authors: users[];
  messages: SerializedMessage[];
  isSubDomainRouting: boolean;
  communityName: string;
  communityType: string;
  slug: string | null;
}) {
  return (
    <div className="flex w-full">
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
        <div className="flex flex-row pb-2">
          <p className="font-semibold text-sm inline-block">
            {author?.displayName || 'user'}
          </p>
          <div className="text-sm text-gray-400 pl-2">
            {format(new Date(newestMessage?.sentAt))}
          </div>
        </div>
        <div className="pb-2 max-w-3xl">
          <Message
            text={oldestMessage?.body || ''}
            mentions={oldestMessage?.mentions.map((m) => m.users)}
            reactions={oldestMessage?.reactions}
            attachments={oldestMessage?.attachments}
          />
        </div>
        <div className="flex flex-row items-center pr-2">
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
            {messages.length > 1 && (
              //Kam: Not sure about this blue but I wanted to add some color to make the page more interesting
              <div className="px-2 text-blue-800">
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
  );
}
