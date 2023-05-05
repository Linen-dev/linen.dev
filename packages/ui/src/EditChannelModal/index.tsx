import React from 'react';
import Modal from '@/Modal';
import Label from '@/Label';
import H3 from '@/H3';
import TextInput from '@/TextInput';
import Icon from '@/Icon';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { SerializedChannel } from '@linen/types';
import styles from './index.module.scss';

interface Props {
  open: boolean;
  close(): void;
  channel: SerializedChannel;
}

export default function EditChannelModal({ open, close, channel }: Props) {
  return (
    <Modal open={open} close={close}>
      <div className={styles.header}>
        <H3>Edit Channel</H3>
        <Icon onClick={close}>
          <FiX />
        </Icon>
      </div>
      <Label htmlFor="name">
        Name
        <br />
        <span className="text-xs font-normal text-gray-700">
          Letters, spaces and apostrophes.
        </span>
      </Label>
      <TextInput
        id="name"
        required
        type="text"
        icon={<FiHash />}
        title="Letters, spaces and apostrophes."
        value={channel.channelName}
      />
      <div className="p-2"></div>
    </Modal>
  );
}
