import React from 'react';
import Toggle from '@/Toggle';
import Modal from '@/Modal';
import {
  SerializedChannel,
  InboxConfig,
  InboxChannelConfig,
} from '@linen/types';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import styles from './index.module.scss';

interface Props {
  open: boolean;
  close(): void;
  configuration: InboxConfig;
  channels: SerializedChannel[];
  dms: SerializedChannel[];
  onChange(channelId: string): void;
}

export default function ConfigureInboxModal({
  open,
  close,
  configuration,
  channels,
  onChange,
  dms,
}: Props) {
  return (
    <Modal open={open} close={close} size="lg">
      <h2 className={styles.h2}>Inbox</h2>
      {showOptions({ title: 'Channels', channels, configuration, onChange })}
      <div className="p-2"></div>
      {showOptions({ title: 'DMs', channels: dms, configuration, onChange })}
    </Modal>
  );
}

function showOptions({
  title,
  channels,
  configuration,
  onChange,
}: {
  title: string;
  channels: SerializedChannel[];
  configuration: InboxConfig;
  onChange(channelId: string): void;
}) {
  return (
    <>
      <h3 className={styles.h3}>
        <FiHash /> {title}
      </h3>
      <ul className={styles.toggles}>
        {configuration.channels.map((config: InboxChannelConfig) => {
          const channel = channels.find(
            (channel) => channel.id === config.channelId
          );
          if (!channel) {
            return null;
          }
          const { subscribed } = config;
          return (
            <li className={styles.toggle} key={`config-channel-${channel.id}`}>
              <Toggle
                checked={subscribed}
                onChange={() => onChange(channel.id)}
              />{' '}
              {channel.channelName}
            </li>
          );
        })}
      </ul>
    </>
  );
}
