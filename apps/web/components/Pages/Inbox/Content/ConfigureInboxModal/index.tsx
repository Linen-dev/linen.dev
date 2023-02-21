import React, { useState } from 'react';
import { Modal, Toggle } from '@linen/ui';
import { SerializedChannel } from '@linen/types';
import { FiHash } from 'react-icons/fi';
import styles from './index.module.scss';
import { InboxConfig, InboxChannelConfig } from '../../types';

interface Props {
  open: boolean;
  close(): void;
  channels: SerializedChannel[];
}

export default function ConfigureInboxModal({ open, close, channels }: Props) {
  const [configuration, setConfiguration] = useState<InboxConfig>({
    channels: channels.map((channel) => {
      return {
        channel,
        subscribed: true,
      };
    }),
  });

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
                onChange={() => {
                  setConfiguration((configuration) => {
                    return {
                      ...configuration,
                      channels: configuration.channels.map((config) => {
                        if (config.channel.id === channel.id) {
                          return {
                            ...config,
                            subscribed: !config.subscribed,
                          };
                        }
                        return config;
                      }),
                    };
                  });
                }}
              />{' '}
              {channel.channelName}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
