import React, { useState } from 'react';
import classNames from 'classnames';
import GridRow from '@/GridRow';
import ImagePreview from '@/ImagePreview';
import { SerializedThread } from '@linen/types';
import { SerializedUser } from '@linen/types';
import { Settings, onResolve } from '@linen/types';
import { Permissions } from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';
import { getImageUrls } from './utilities/thread';
import { isAuthorActive } from '@linen/utilities/isAuthorActive';

interface Props {
  thread: SerializedThread;
  permissions: Permissions;
  settings: Settings;
  isBot?: boolean;
  isSubDomainRouting: boolean;
  currentUser: SerializedUser | null;
  activeUsers?: string[];
  mode?: Mode;
  onDelete?(messageId: string): void;
  onEdit?(threadId: string, messageId: string): void;
  onResolution?: onResolve;
  onLoad?(): void;
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

function Messages({
  thread,
  permissions,
  settings,
  isBot,
  isSubDomainRouting,
  currentUser,
  activeUsers,
  mode,
  onDelete,
  onEdit,
  onLoad,
  onReaction,
  onResolution,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const images = getImageUrls(thread);
  const { messages } = thread;

  const elements = messages.map((message, index) => {
    const previous = messages[index - 1];
    const showAvatar =
      index === 0 ||
      !message.usersId ||
      (previous && previous.usersId !== message.usersId);
    return (
      <div id={message.id} key={`${message.id}`} className={styles.container}>
        <GridRow
          className={classNames({
            [styles['padding-top']]: showAvatar,
          })}
          thread={thread}
          message={message}
          isUserActive={isAuthorActive(
            message?.author,
            currentUser,
            activeUsers
          )}
          showAvatar={showAvatar}
          isBot={isBot}
          permissions={permissions}
          currentUser={currentUser}
          settings={settings}
          isSubDomainRouting={isSubDomainRouting}
          mode={mode}
          drag="message"
          onDelete={onDelete}
          onEdit={onEdit}
          onLoad={onLoad}
          onReaction={onReaction}
          onResolution={onResolution}
          onImageClick={(src) => setPreview(src)}
        />
      </div>
    );
  });

  return (
    <div>
      {elements}
      {preview && (
        <ImagePreview
          current={preview}
          images={images}
          onClick={() => setPreview(null)}
        />
      )}
    </div>
  );
}

export default Messages;
