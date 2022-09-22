import Avatar, { Size } from 'components/Avatar';
import classNames from 'classnames';
import Message from '../../Message';
import { format } from 'timeago.js';
import { SerializedMessage } from 'serializers/message';
import CopyToClipboardIcon from 'components/Pages/ChannelsPage/CopyToClipboardIcon';
import styles from './index.module.css';

interface Props {
  message: SerializedMessage;
  isPreviousMessageFromSameUser: boolean;
  isNextMessageFromSameUser: boolean;
  communityType: string;
  threadLink?: string;
}

export function Row({
  message,
  isPreviousMessageFromSameUser,
  isNextMessageFromSameUser,
  communityType,
  threadLink,
}: Props) {
  return (
    <li
      id={message.id}
      className={classNames(styles.row, { 'pb-4': !isNextMessageFromSameUser })}
      key={message.id}
    >
      <div className={styles.avatar}>
        {!isPreviousMessageFromSameUser && (
          <div className="flex pr-3">
            <Avatar
              size={Size.lg}
              alt={message.author?.displayName || 'avatar'}
              src={message.author?.profileImageUrl}
              text={(message.author?.displayName || '?')
                .slice(0, 1)
                .toLowerCase()}
            />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className="flex flex-col w-full">
          {!isPreviousMessageFromSameUser && (
            <div className="flex flex-row pb-1">
              <p className="font-semibold text-sm inline-block">
                {message.author?.displayName || 'user'}
              </p>
              <div className="text-sm text-gray-400 pl-2">
                {format(new Date(message.sentAt))}
              </div>
            </div>
          )}
          <div className={styles.showOnHover}>
            {!!threadLink && (
              <div className={styles.threadLink}>
                <CopyToClipboardIcon
                  getText={() => threadLink + '#' + message.id}
                />
              </div>
            )}
            <Message
              text={message.body}
              format={communityType}
              mentions={message.mentions?.map((m) => m.users)}
              reactions={message.reactions}
              attachments={message.attachments}
            />
          </div>
        </div>
      </div>
    </li>
  );
}

export default Row;
