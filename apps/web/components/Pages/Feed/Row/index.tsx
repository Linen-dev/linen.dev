import React from 'react';
import classNames from 'classnames';
import Avatar from 'components/Avatar';
import { Checkbox } from '@linen/ui';
import Title from './Title';
import Description from './Description';
import styles from './index.module.css';
import { SerializedThread } from 'serializers/thread';
import { Permissions } from 'types/shared';

interface Props {
  thread: SerializedThread;
  selected: boolean;
  permissions: Permissions;
  onChange(id: string, checked: boolean): void;
  onClick(): void;
}

export default function Row({
  thread,
  selected,
  permissions,
  onChange,
  onClick,
}: Props) {
  const message = thread.messages[thread.messages.length - 1];
  const { channel, id } = thread;
  return (
    <div className={classNames(styles.row, { [styles.selected]: selected })}>
      <div className={styles.content}>
        {permissions.manage && (
          <Checkbox
            className={styles.checkbox}
            checked={selected}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              event.stopPropagation();
              const { checked } = event.target;
              onChange(id, checked);
            }}
          />
        )}

        <div className={styles.body} onClick={onClick}>
          <Avatar
            size="md"
            src={message.author?.profileImageUrl}
            text={message.author?.displayName}
          />
          <div>
            {channel && (
              <div className={styles.channel}>#{channel.channelName}</div>
            )}
            <Title thread={thread} />
            <Description messages={thread.messages} />
          </div>
        </div>
      </div>
    </div>
  );
}
