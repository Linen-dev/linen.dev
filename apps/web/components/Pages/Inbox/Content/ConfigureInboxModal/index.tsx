import React from 'react';
import { Modal, Toggle } from '@linen/ui';
import { FiHash } from 'react-icons/fi';
import styles from './index.module.scss';
import { InboxConfig, InboxChannelConfig } from '../../types';

interface Props {
  open: boolean;
  close(): void;
  configuration: InboxConfig;
  onChange(channelId: string): void;
}

export default function ConfigureInboxModal({
  open,
  close,
  configuration,
  onChange,
}: Props) {
  return (
    <Modal open={open} close={close} size="lg">
      <h2 className={styles.h2}>Inbox</h2>
      <h3 className={styles.h3}>
        <FiHash /> Channels
      </h3>
      <ul className={styles.toggles}>
        {configuration.channels.map((config: InboxChannelConfig) => {
          const { channel, subscribed } = config;
          return (
            <li className={styles.toggle}>
              <Toggle
                checked={subscribed}
                onChange={() => onChange(channel.id)}
              />{' '}
              {channel.channelName}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
