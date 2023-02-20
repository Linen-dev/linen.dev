import React from 'react';
import { Modal } from '@linen/ui';
import { SerializedChannel } from '@linen/types';

interface Props {
  open: boolean;
  close(): void;
  channels: SerializedChannel[];
}

export default function ConfigureInboxModal({ open, close, channels }: Props) {
  return (
    <Modal open={open} close={close}>
      {channels.map((channel) => {
        return channel.channelName;
      })}
    </Modal>
  );
}
