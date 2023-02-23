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
  ThreadStatus,
  ReminderTypes,
  onResolve,
} from '@linen/types';
import { copyToClipboard } from '@linen/utilities/clipboard';
import { GoPin } from '@react-icons/all-files/go/GoPin';
import { AiOutlinePaperClip } from '@react-icons/all-files/ai/AiOutlinePaperClip';
import { AiOutlineHighlight } from '@react-icons/all-files/ai/AiOutlineHighlight';
import { GrDrag } from '@react-icons/all-files/gr/GrDrag';
import { FiClock } from '@react-icons/all-files/fi/FiClock';
import { FiThumbsUp } from '@react-icons/all-files/fi/FiThumbsUp';
import { FiTrash2 } from '@react-icons/all-files/fi/FiTrash2';
import { FaVolumeMute } from '@react-icons/all-files/fa/FaVolumeMute';
import { BiMessageCheck } from '@react-icons/all-files/bi/BiMessageCheck';
import styles from './index.module.scss';
import { Mode } from '@linen/hooks/mode';
import ReminderModal from './ReminderModal';

interface Props {
  className?: string;
  thread: SerializedThread;
  message: SerializedMessage;
  permissions: Permissions;
  status?: ThreadStatus;
  settings: Settings;
  isSubDomainRouting: boolean;
  currentUser: SerializedUser | null;
  mode?: Mode;
  drag: 'thread' | 'message';
  onDelete?(messageId: string): void;
  onMute?(threadId: string): void;
  onUnmute?(threadId: string): void;
  onPin?(threadId: string): void;
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
  onRead?(threadId: string): void;
  onRemind?(threadId: string, reminder: ReminderTypes): void;
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

enum ModalView {
  NONE,
  REMINDER,
  DELETE,
}

export default function Actions({
  className,
  thread,
  message,
  permissions,
  status,
  settings,
  isSubDomainRouting,
  currentUser,
  mode,
  drag,
  onDelete,
  onMute,
  onUnmute,
  onPin,
  onResolution,
  onReaction,
  onRead,
  onRemind,
  onUnread,
}: Props) {
  const [modal, setModal] = useState<ModalView>(ModalView.NONE);
  const isReactionActive = hasReaction(message, ':thumbsup:', currentUser?.id);
  const owner = currentUser ? currentUser.id === message.usersId : false;
  const draggable = permissions.manage || owner;

  const isReadVisible =
    onRead &&
    currentUser &&
    (status === ThreadStatus.UNREAD ||
      status === ThreadStatus.MUTED ||
      status === ThreadStatus.REMINDER);

  const isRemindVisible =
    onRemind &&
    currentUser &&
    (status === ThreadStatus.UNREAD ||
      status === ThreadStatus.READ ||
      status === ThreadStatus.MUTED);

  const isMuteVisible =
    onMute &&
    currentUser &&
    (status === ThreadStatus.UNREAD ||
      status === ThreadStatus.READ ||
      status === ThreadStatus.REMINDER);

  const isDeleteVisible =
    onDelete &&
    currentUser &&
    (permissions.manage || currentUser.id === message.usersId);

  return (
    <>
      <ul className={classNames(styles.actions, className)}>
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
        {onUnread && currentUser && status === ThreadStatus.READ && (
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
        {onUnmute && currentUser && status === ThreadStatus.MUTED && (
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
              setModal(ModalView.REMINDER);
            }}
          >
            <Tooltip className={styles.tooltip} text="Remind me">
              <FiClock />
            </Tooltip>
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
        {onPin && permissions.manage && (
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
        {onResolution && (
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
        {currentUser && draggable && (
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
        {isDeleteVisible && (
          <li onClick={() => setModal(ModalView.DELETE)}>
            <Tooltip className={styles.tooltip} text="Delete">
              <FiTrash2 />
            </Tooltip>
          </li>
        )}
      </ul>
      {isRemindVisible && (
        <ReminderModal
          open={modal === ModalView.REMINDER}
          close={() => setModal(ModalView.NONE)}
          onConfirm={(reminder: ReminderTypes) => {
            onRemind(thread.id, reminder);
            setModal(ModalView.NONE);
          }}
        />
      )}
      {isDeleteVisible && (
        <ConfirmationModal
          title="Delete message"
          description="Permanently delete this message?"
          confirm="Delete"
          open={modal === ModalView.DELETE}
          close={() => setModal(ModalView.NONE)}
          onConfirm={() => {
            onDelete(message.id);
            setModal(ModalView.NONE);
          }}
        />
      )}
    </>
  );
}
