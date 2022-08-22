import Avatar, { Size } from '../../Avatar';
import Message from '../../Message';
import { format } from 'timeago.js';
import { SerializedMessage } from 'serializers/thread';

interface Props {
  message: SerializedMessage;
  isPreviousMessageFromSameUser: boolean;
  isNextMessageFromSameUser: boolean;
  communityType: string;
}

export function Row({
  message,
  isPreviousMessageFromSameUser,
  isNextMessageFromSameUser,
  communityType,
}: Props) {
  if (isPreviousMessageFromSameUser) {
    return (
      <li
        className={isNextMessageFromSameUser ? 'pb-1' : 'pb-8'}
        key={message.id}
      >
        <div className="max-w-[700px]">
          <Message
            text={message.body}
            format={communityType}
            mentions={message.mentions?.map((m) => m.users)}
            reactions={message.reactions}
            attachments={message.attachments}
          />
        </div>
      </li>
    );
  }
  return (
    <li
      className={isNextMessageFromSameUser ? 'pb-1' : 'pb-8'}
      key={message.id}
    >
      <div className="flex justify-between">
        <div className="flex pb-4">
          <Avatar
            size={Size.lg}
            alt={message.author?.displayName || 'avatar'}
            src={message.author?.profileImageUrl}
            text={(message.author?.displayName || '?')
              .slice(0, 1)
              .toLowerCase()}
          />
          <div className="pl-3">
            <p className="font-semibold text-sm inline-block">
              {message.author?.displayName || 'user'}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {format(new Date(message.sentAt))}
        </div>
      </div>
      <div className="max-w-[700px]">
        <Message
          text={message.body}
          format={communityType}
          mentions={message.mentions?.map((m) => m.users)}
          reactions={message.reactions}
          attachments={message.attachments}
        />
      </div>
    </li>
  );
}

export default Row;
