import { useState } from 'react';
import classNames from 'classnames';
import Draggable from './Draggable';
import { getThreadUrl } from '@linen/utilities/url';
import Toast from '@linen/ui/Toast';
import Tooltip from '@linen/ui/Tooltip';
import {
  Permissions,
  Settings,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  ReminderTypes,
  onResolve,
} from '@linen/types';
import { copyToClipboard } from '@linen/utilities/clipboard';
import { GoPin } from '@react-icons/all-files/go/GoPin';
import { FiStar } from '@react-icons/all-files/fi/FiStar';
import { AiOutlinePaperClip } from '@react-icons/all-files/ai/AiOutlinePaperClip';
import { AiOutlineHighlight } from '@react-icons/all-files/ai/AiOutlineHighlight';
import { GrDrag } from '@react-icons/all-files/gr/GrDrag';
import { FiClock } from '@react-icons/all-files/fi/FiClock';
import { FiEdit } from '@react-icons/all-files/fi/FiEdit';
import { FiThumbsUp } from '@react-icons/all-files/fi/FiThumbsUp';
import { FiTrash2 } from '@react-icons/all-files/fi/FiTrash2';
import { FaVolumeMute } from '@react-icons/all-files/fa/FaVolumeMute';
import { BiMessageCheck } from '@react-icons/all-files/bi/BiMessageCheck';
import styles from './index.module.scss';
import { Mode } from '@linen/hooks/mode';
import { LINEN_URL } from 'secrets';

interface Props {
  className?: string;
  thread: SerializedThread;
  message: SerializedMessage;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  currentUser: SerializedUser | null;
  mode?: Mode;
  drag: 'thread' | 'message';
  onDelete?(): void;
  onMute?(threadId: string): void;
  onUnmute?(threadId: string): void;
  onPin?(threadId: string): void;
  onStar?(threadId: string): void;
  onResolution?: onResolve;
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
  onEdit?(threadId: string): void;
  onRead?(threadId: string): void;
  onRemind?(): void;
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

// enum ModalView {
//   NONE,
//   REMINDER,
//   DELETE,
// }

export default function Actions({
  className,
  thread,
  message,
  permissions,
  settings,
  isSubDomainRouting,
  currentUser,
  mode,
  drag,
  onDelete,
  onEdit,
  onMute,
  onUnmute,
  onPin,
  onStar,
  onResolution,
  onReaction,
  onRead,
  onRemind,
  onUnread,
}: Props) {
  // const [modal, setModal] = useState<ModalView>(ModalView.NONE);
  const isReactionActive = hasReaction(message, ':thumbsup:', currentUser?.id);
  const owner = currentUser ? currentUser.id === message.usersId : false;
  const draggable = permissions.manage || owner;

  const isEditVisible = onEdit && currentUser;
  const isReadVisible = false && onRead && currentUser;
  const isUnreadVisible = false && onUnread && currentUser;
  const isRemindVisible = false && onRemind && currentUser;
  const isMuteVisible = false && onMute && currentUser;
  const isOnmuteVisible = false && onUnmute && currentUser;
  const isPinVisible = onPin && permissions.manage;
  const isStarVisible = onStar && permissions.starred;
  const isReactionVisible = onReaction && currentUser;
  const isResolutionVisible = onResolution && currentUser;
  const isDragVisible = currentUser && draggable;
  const isDeleteVisible =
    onDelete &&
    currentUser &&
    (permissions.manage || currentUser.id === message.usersId);

  return (
    <>
      <ul className={classNames(styles.actions, className)}>
        {isEditVisible && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onEdit(thread.id);
            }}
          >
            <Tooltip className={styles.tooltip} text="Edit">
              <FiEdit />
            </Tooltip>
          </li>
        )}
        {isReadVisible && (
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
        {isUnreadVisible && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onUnread(thread.id);
            }}
          >
            <Tooltip className={styles.tooltip} text="Unread">
              <BiMessageCheck className={styles.active} />
            </Tooltip>
          </li>
        )}
        {isMuteVisible && (
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
        {isOnmuteVisible && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onUnmute(thread.id);
            }}
          >
            <Tooltip className={styles.tooltip} text="Unmute">
              <FaVolumeMute className={styles.active} />
            </Tooltip>
          </li>
        )}
        {isRemindVisible && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onRemind();
            }}
          >
            <Tooltip className={styles.tooltip} text="Reminder">
              <FiClock />
            </Tooltip>
          </li>
        )}
        {isReactionVisible && (
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
        {isPinVisible && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onPin(thread.id);
            }}
          >
            <Tooltip className={styles.tooltip} text="Pin">
              <GoPin
                className={classNames({ [styles.active]: thread.pinned })}
              />
            </Tooltip>
          </li>
        )}
        {isStarVisible && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onStar(thread.id);
            }}
          >
            <Tooltip className={styles.tooltip} text="Star">
              <FiStar className={classNames({ [styles.active]: false })} />
            </Tooltip>
          </li>
        )}
        {isResolutionVisible && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              if (thread.resolutionId !== message.id) {
                onResolution(thread.id, message.id);
              } else {
                onResolution(thread.id);
              }
            }}
          >
            <Tooltip className={styles.tooltip} text="Mark resolution">
              <AiOutlineHighlight
                className={classNames({
                  [styles.active]: thread.resolutionId === message.id,
                })}
              />
            </Tooltip>
          </li>
        )}
        {isDragVisible && (
          <li>
            <Draggable
              id={drag === 'thread' ? thread.id : message.id}
              draggable={draggable}
              source={drag}
              mode={mode}
            >
              <Tooltip className={styles.tooltip} text="Move">
                <GrDrag />
              </Tooltip>
            </Draggable>
          </li>
        )}
        <li
          onClick={(event) => {
            const text = getThreadUrl({
              isSubDomainRouting,
              settings,
              incrementId: thread.incrementId,
              slug: thread.slug,
              messageId: message.id,
              LINEN_URL,
            });
            event.stopPropagation();
            event.preventDefault();
            copyToClipboard(text);
            Toast.success('Copied to clipboard');
          }}
        >
          <Tooltip className={styles.tooltip} text="URL">
            <AiOutlinePaperClip />
          </Tooltip>
        </li>
        {isDeleteVisible && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onDelete();
            }}
          >
            <Tooltip className={styles.tooltip} text="Delete">
              <FiTrash2 />
            </Tooltip>
          </li>
        )}
      </ul>
    </>
  );
}
