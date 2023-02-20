import React from 'react';
import { Modal, Toggle } from '@linen/ui';
import { SerializedChannel } from '@linen/types';
import { FiHash } from 'react-icons/fi';
import styles from './index.module.scss';

interface Props {
  open: boolean;
  close(): void;
  channels: SerializedChannel[];
}

export default function ConfigureInboxModal({ open, close, channels }: Props) {
  return (
    <Modal open={open} close={close} size="lg">
      <h2 className={styles.h2}>
        <FiHash /> Channels
      </h2>
      <ul className={styles.toggles}>
        {channels.map((channel) => {
          return (
            <li className={styles.toggle}>
              <Toggle checked onChange={() => {}} /> {channel.channelName}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
