import { useState } from 'react';
import classNames from 'classnames';
import Draggable from './Draggable';
import { getThreadUrl } from '../Pages/Channel/utilities/url';
import { Toast, Tooltip, ConfirmationModal } from '@linen/ui';
import {
  Permissions,
  Settings,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  SerializedUserThreadStatus,
} from '@linen/types';
import { copyToClipboard } from '@linen/utilities/clipboard';
import { GoPin } from 'react-icons/go';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { RxDragHandleDots2 } from 'react-icons/rx';
import { FiThumbsUp, FiTrash2 } from 'react-icons/fi';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { BiMessageCheck } from 'react-icons/bi';
import styles from './index.module.scss';
import { Mode } from '@linen/hooks/mode';

interface Props {
  className?: string;
  thread: SerializedThread;
  message: SerializedMessage;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  currentUser: SerializedUser | null;
  userThreadStatus?: SerializedUserThreadStatus;
  mode?: Mode;
  drag: 'thread' | 'message';
  onDelete?(messageId: string): void;
  onMute?(threadId: string): void;
  onUnmute?(threadId: string): void;
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
  onRead?(threadId: string): void;
  onUnread?(threadId: string): void;
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

export default function Actions({
  className,
  thread,
  message,
  permissions,
  settings,
  isSubDomainRouting,
  currentUser,
  userThreadStatus,
  mode,
  drag,
  onDelete,
  onMute,
  onUnmute,
  onPin,
  onReaction,
  onRead,
  onUnread,
}: Props) {
  const [modal, setModal] = useState(false);
  const isReactionActive = hasReaction(message, ':thumbsup:', currentUser?.id);
  const owner = currentUser ? currentUser.id === message.usersId : false;
  const draggable = permissions.manage || owner;

  return (
    <ul className={classNames(styles.actions, className)}>
      {onRead && currentUser && (!userThreadStatus || !userThreadStatus.read) && (
        <li
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onRead(thread.id);
          }}
        >
          <Tooltip className={styles.tooltip} text="Read">
            <BiMessageCheck />
          </Tooltip>
        </li>
      )}
      {onUnread && currentUser && userThreadStatus && userThreadStatus.read && (
        <li
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onUnread(thread.id);
          }}
        >
          <Tooltip className={styles.tooltip} text="Unread">
            <BiMessageCheck className={classNames({ [styles.active]: true })} />
          </Tooltip>
        </li>
      )}
      {onMute && currentUser && (!userThreadStatus || !userThreadStatus.muted) && (
        <li
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onMute(thread.id);
          }}
        >
          <Tooltip className={styles.tooltip} text="Mute">
            <FaVolumeMute />
          </Tooltip>
        </li>
      )}
      {onUnmute && currentUser && userThreadStatus && userThreadStatus.muted && (
        <li
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onUnmute(thread.id);
          }}
        >
          <Tooltip className={styles.tooltip} text="Unmute">
            <FaVolumeUp />
          </Tooltip>
        </li>
      )}
      {currentUser && draggable && (
        <li>
          <Draggable
            id={drag === 'thread' ? thread.id : message.id}
            draggable={draggable}
            source={drag}
            mode={mode}
          >
            <Tooltip className={styles.tooltip} text="Move">
              <RxDragHandleDots2 />
            </Tooltip>
          </Draggable>
        </li>
      )}
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
          <Tooltip className={styles.tooltip} text="Like">
            <FiThumbsUp
              className={classNames({
                [styles.active]: isReactionActive,
              })}
            />
          </Tooltip>
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
          Toast.success('Copied to clipboard', text);
        }}
      >
        <Tooltip className={styles.tooltip} text="URL">
          <AiOutlinePaperClip />
        </Tooltip>
      </li>
      {onPin && permissions.manage && (
        <li
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onPin(thread.id);
          }}
        >
          <Tooltip className={styles.tooltip} text="Pin">
            <GoPin className={classNames({ [styles.active]: thread.pinned })} />
          </Tooltip>
        </li>
      )}
      {onDelete &&
        currentUser &&
        (permissions.manage || currentUser.id === message.usersId) && (
          <>
            <li onClick={() => setModal(true)}>
              <Tooltip className={styles.tooltip} text="Delete">
                <FiTrash2 />
              </Tooltip>
            </li>
            <ConfirmationModal
              title="Delete message"
              description="Permanently delete this message?"
              confirm="Delete"
              open={modal}
              close={() => setModal(false)}
              onConfirm={() => {
                onDelete(message.id);
                setModal(false);
              }}
            />
          </>
        )}
    </ul>
  );
}
