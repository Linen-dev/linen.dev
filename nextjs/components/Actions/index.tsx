import React from 'react';
import classNames from 'classnames';
import { getThreadUrl } from '../Pages/ChannelsPage/utilities/url';
import { copyToClipboard } from 'utilities/clipboard';
import { toast } from 'components/Toast';
import { Permissions } from 'types/shared';
import { GoPin } from 'react-icons/go';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { FiThumbsUp } from 'react-icons/fi';
import type { Settings } from 'serializers/account/settings';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import { SerializedMessage } from 'serializers/message';
import styles from './index.module.scss';

interface Props {
  className?: string;
  thread: SerializedThread;
  message: SerializedMessage;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  currentUser: SerializedUser | null;
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
}

function hasReaction(
  message: SerializedMessage,
  type: string,
  userId?: string
): boolean {
  if (!userId) {
    return false;
  }
  const reaction = message.reactions.find((reaction) => reaction.type === type);
  if (!reaction) {
    return false;
  }
  return !!reaction.users.find(({ id }) => id === userId);
}

export default function Options({
  className,
  thread,
  message,
  permissions,
  settings,
  isSubDomainRouting,
  currentUser,
  onReaction,
  onPin,
}: Props) {
  const isReactionActive = hasReaction(message, ':thumbsup:', currentUser?.id);
  return (
    <ul className={classNames(styles.options, className)}>
      {onReaction && currentUser && (
        <li
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onReaction({
              threadId: thread.id,
              messageId: message.id,
              type: ':thumbsup:',
              active: isReactionActive,
            });
          }}
        >
          <FiThumbsUp
            className={classNames({
              [styles.active]: isReactionActive,
            })}
          />
        </li>
      )}
      <li
        onClick={(event) => {
          const text = getThreadUrl({
            isSubDomainRouting,
            settings,
            incrementId: thread.incrementId,
            slug: thread.slug,
          });
          event.stopPropagation();
          event.preventDefault();
          copyToClipboard(text);
          toast.success('Copied to clipboard', text);
        }}
      >
        <AiOutlinePaperClip />
      </li>
      {onPin && permissions.manage && (
        <li
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onPin(thread.id);
          }}
        >
          <GoPin className={classNames({ [styles.active]: thread.pinned })} />
        </li>
      )}
    </ul>
  );
}
