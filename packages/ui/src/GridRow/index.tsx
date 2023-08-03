import React, { useState } from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import Avatar from '@/Avatar';
import Badge from '@/Badge';
import Message from '@/Message';
import ConfirmationModal from '@/ConfirmationModal';
import ReminderModal from '@/ReminderModal';
import EmojiPickerModal from '@/EmojiPickerModal';
import { format } from '@linen/utilities/date';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiShield } from '@react-icons/all-files/fi/FiShield';
import Tooltip from '@/Tooltip';
import { Mode } from '@linen/hooks/mode';
import useHover from '@linen/hooks/hover';
import {
  Permissions,
  Settings,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  ReminderTypes,
  onResolve,
  Roles,
} from '@linen/types';
import styles from './index.module.scss';
import Actions from '@/Actions';
import { getThreadUrl } from '@linen/utilities/url';

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
function isArchiveUrl(input: string): boolean {
  const url = new URL(input);
  if (
    url.hostname.endsWith('.slack.com') &&
    url.pathname.startsWith('/archives/')
  ) {
    return true;
  }
  return false;
}

interface Props {
  className?: string;
  thread: SerializedThread;
  message: SerializedMessage;
  isUserActive?: boolean;
  isBot?: boolean;
  isPreviousMessageFromSameUser?: boolean;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions?: Permissions;
  currentUser: SerializedUser | null;
  mode?: Mode;
  drag: 'thread' | 'message';
  header?: React.ReactNode;
  subheader?: React.ReactNode;
  info?: React.ReactNode;
  showActions?: boolean;
  truncate?: boolean;
  footer?({ inView }: { inView: boolean }): React.ReactNode;
  onDelete?(messageId: string): void;
  onLoad?(): void;
  onEdit?(threadId: string, messageId: string): void;
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
  onRead?(threadId: string): void;
  onRemind?(threadId: string, reminder: ReminderTypes): void;
  onUnread?(threadId: string): void;
  onImageClick?(src: string): void;
}

function Left({
  top,
  message,
  isBot,
  hover,
  inView,
  isUserActive,
}: {
  top: boolean;
  message: SerializedMessage;
  isBot: boolean;
  hover?: boolean;
  inView: boolean;
  isUserActive?: boolean;
}) {
  if (top) {
    return (
      <Avatar
        className={styles.left}
        src={message.author?.profileImageUrl}
        text={message.author?.displayName}
        placeholder={!inView || isBot}
        active={isUserActive}
        isBot={isBot}
      />
    );
  }

  return (
    <div className={styles.left}>
      {hover && (
        <span className={styles.date}>{format(message.sentAt, 'p')}</span>
      )}
    </div>
  );
}

enum ModalView {
  NONE,
  REMINDER,
  DELETE,
  EMOJI_PICKER,
}

function Row({
  className,
  thread,
  message,
  isUserActive,
  isBot = false,
  isPreviousMessageFromSameUser,
  isSubDomainRouting,
  currentUser,
  settings,
  permissions,
  mode,
  drag,
  header,
  subheader,
  info,
  showActions,
  truncate,
  footer,
  onDelete,
  onEdit,
  onLoad,
  onMute,
  onUnmute,
  onPin,
  onStar,
  onResolution,
  onReaction,
  onRead,
  onRemind,
  onUnread,
  onImageClick,
}: Props) {
  const [modal, setModal] = useState<ModalView>(ModalView.NONE);
  const [ref, hover] = useHover<HTMLDivElement>();
  const { ref: inViewRef, inView } = useInView();
  const top = !isPreviousMessageFromSameUser;
  const resolution = thread.resolutionId === message.id;

  function onLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const url = event.currentTarget.href;
    if (isArchiveUrl(url)) {
      event.stopPropagation();
      event.preventDefault();
      fetch('/api/link', {
        method: 'POST',
        body: JSON.stringify({
          url,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(({ incrementId }) => {
          if (incrementId) {
            window.location.href = getThreadUrl({
              isSubDomainRouting,
              settings,
              incrementId,
              LINEN_URL:
                process.env.NODE_ENV === 'development'
                  ? 'http://localhost:3000'
                  : 'https://www.linen.dev',
            });
          } else {
            window.location.href = url;
          }
        });
    }
  }

  const isAdminOrOwner =
    message.author?.role === Roles.ADMIN ||
    message.author?.role === Roles.OWNER;

  return (
    <div
      ref={ref}
      className={classNames(className, styles.container, {
        [styles.resolution]: resolution,
        [styles.top]: top,
      })}
    >
      {header}
      <div
        ref={inViewRef}
        className={classNames(styles.row, {
          [styles.drag]: mode === Mode.Drag,
        })}
      >
        <Left
          message={message}
          top={top}
          isBot={isBot}
          hover={hover}
          inView={inView}
          isUserActive={isUserActive}
        />
        <div className={styles.content}>
          {top && (
            <div className={styles.header}>
              <p className={styles.username}>
                {message.author?.displayName || 'user'}
              </p>
              {isAdminOrOwner && (
                <Tooltip text="Admin" offset={16}>
                  <div className={styles.role}>
                    <FiShield />
                  </div>
                </Tooltip>
              )}
              {subheader || format(message.sentAt, 'Pp')}
              {info}
            </div>
          )}
          <div
            className={classNames(styles.message, {
              [styles.top]: top,
              [styles.basic]: !top,
            })}
          >
            <Message
              text={message.body}
              format={message.messageFormat}
              truncate={truncate}
              mentions={message.mentions}
              reactions={message.reactions
                .filter((reaction) => {
                  if (thread.channel?.viewType === 'FORUM') {
                    if (
                      reaction.type === ':thumbsup:' ||
                      reaction.type === ':thumbsdown:'
                    ) {
                      return null;
                    }
                  }
                  return reaction;
                })
                .filter(Boolean)}
              attachments={message.attachments}
              currentUser={currentUser}
              onLinkClick={onLinkClick}
              onImageClick={onImageClick}
              onLoad={onLoad}
              placeholder={!inView}
              isBot={isBot}
            />
            {resolution && (
              <Badge className={styles.badge} type="success">
                <FiCheck className={styles.resolutionCheck} />
                Resolution
              </Badge>
            )}
            {footer?.({ inView })}
          </div>
        </div>
      </div>
      {hover && showActions && (
        <div className={styles.actions}>
          <Actions
            thread={thread}
            message={message}
            settings={settings}
            permissions={permissions}
            currentUser={currentUser}
            isSubDomainRouting={isSubDomainRouting}
            drag={drag}
            onDelete={onDelete ? () => setModal(ModalView.DELETE) : undefined}
            onEdit={onEdit}
            onMute={onMute}
            onUnmute={onUnmute}
            onPin={onPin}
            onStar={onStar}
            onResolution={onResolution}
            onEmoji={
              onReaction ? () => setModal(ModalView.EMOJI_PICKER) : undefined
            }
            onRead={onRead}
            onRemind={onRemind ? () => setModal(ModalView.REMINDER) : undefined}
            onUnread={onUnread}
            mode={mode}
          />
        </div>
      )}
      {onRemind && (
        <ReminderModal
          open={modal === ModalView.REMINDER}
          close={() => {
            setModal(ModalView.NONE);
          }}
          onConfirm={(reminder: ReminderTypes) => {
            onRemind(thread.id, reminder);
            setModal(ModalView.NONE);
          }}
        />
      )}
      {onDelete && (
        <ConfirmationModal
          title="Delete message"
          description="Permanently delete this message?"
          confirm="Delete"
          open={modal === ModalView.DELETE}
          close={() => {
            setModal(ModalView.NONE);
          }}
          onConfirm={() => {
            onDelete(message.id);
            setModal(ModalView.NONE);
          }}
        />
      )}
      {onReaction && currentUser && (
        <EmojiPickerModal
          open={modal === ModalView.EMOJI_PICKER}
          close={() => {
            setModal(ModalView.NONE);
          }}
          onSelect={(emoji: any) => {
            const type = Array.isArray(emoji.shortcodes)
              ? emoji.shortcodes[0]
              : emoji.shortcodes;
            onReaction({
              threadId: thread.id,
              messageId: message.id,
              type,
              active: hasReaction(message, type, currentUser.id),
            });
            setModal(ModalView.NONE);
          }}
        />
      )}
    </div>
  );
}

Row.defaultProps = {
  showActions: true,
};

export default Row;
