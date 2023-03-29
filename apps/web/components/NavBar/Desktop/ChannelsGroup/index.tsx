import React from 'react';
import classNames from 'classnames';
import { Nav } from '@linen/ui';
import { Permissions, SerializedChannel, SerializedUser } from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiLock } from '@react-icons/all-files/fi/FiLock';
import Link from 'components/Link/InternalLink';
import NewChannelModal from 'components/Modals/NewChannelModal';
import styles from '../index.module.scss';

interface Props {
  channelName: string;
  channels: SerializedChannel[];
  currentUser: SerializedUser | null;
  highlights: string[];
  mode: Mode;
  permissions: Permissions;
  onChannelClick(channelId: string): void;
  onDrop?({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    to: string;
    from: string;
  }): void;
}

export default function ChannelsGroup({
  channelName,
  channels,
  currentUser,
  highlights,
  mode,
  permissions,
  onChannelClick,
  onDrop,
}: Props) {
  return (
    <>
      <Nav.Group>
        Channels
        {currentUser &&
          permissions.channel_create &&
          !!permissions.accountId && <NewChannelModal {...{ permissions }} />}
      </Nav.Group>
      <div>
        {channels.map((channel: SerializedChannel, index: number) => {
          const count = highlights.reduce((count: number, id: string) => {
            if (id === channel.id) {
              return count + 1;
            }
            return count;
          }, 0);

          function handleDrop(event: React.DragEvent) {
            const id = channel.id;
            const text = event.dataTransfer.getData('text');
            const data = JSON.parse(text);
            if (data.id === id) {
              return event.stopPropagation();
            }
            return onDrop?.({
              source: data.source,
              target: 'channel',
              from: data.id,
              to: id,
            });
          }

          function handleDragEnter(event: React.DragEvent) {
            event.currentTarget.classList.add(styles.drop);
          }

          function handleDragLeave(event: React.DragEvent) {
            event.currentTarget.classList.remove(styles.drop);
          }

          const active = channel.channelName === channelName;
          const highlighted = !active && count > 0;

          const Icon = channel.type === 'PRIVATE' ? FiLock : FiHash;

          return (
            <Link
              className={classNames(styles.item, {
                [styles.dropzone]: mode === Mode.Drag,
              })}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => onChannelClick(channel.id)}
              key={`${channel.channelName}-${index}`}
              href={`/c/${channel.channelName}`}
            >
              <Nav.Item active={active} highlighted={highlighted}>
                <Icon /> {channel.channelName}
              </Nav.Item>
            </Link>
          );
        })}
      </div>
    </>
  );
}
