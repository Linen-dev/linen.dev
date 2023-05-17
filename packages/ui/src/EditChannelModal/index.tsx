import React, { useState } from 'react';
import Modal from '@/Modal';
import Label from '@/Label';
import H3 from '@/H3';
import Button from '@/Button';
import TextInput from '@/TextInput';
import Icon from '@/Icon';
import Toggle from '@/Toggle';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { SerializedAccount, SerializedChannel } from '@linen/types';
import styles from './index.module.scss';
import type { ApiClient } from '@linen/api-client';

interface Props {
  open: boolean;
  close(): void;
  channel: SerializedChannel;
  currentCommunity: SerializedAccount;
  api: ApiClient;
}

export default function EditChannelModal({
  open,
  close,
  channel,
  currentCommunity,
  api,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [channelPrivate, setChannelPrivate] = useState(
    channel.type === 'PRIVATE'
  );

  function updateChannel({
    accountId,
    channelId,
    channelName,
  }: {
    accountId: string;
    channelId: string;
    channelName: string;
  }) {
    setLoading(true);
    return api
      .updateChannel({ accountId, channelId, channelName, channelPrivate })
      .then(() => {
        // changing channel name changes the path
        // we'd need to dynamically update it
        // we should most likely send this through websockets
        // to other users to update the channel name dynamically
        // otherwise they'll get a 404 on the previous channel name
        setLoading(false);
        if (channel.channelName !== channelName) {
          window.location.href = window.location.href.replace(
            `/${channel.channelName}`,
            `/${channelName}`
          );
        }
        close();
      })
      .catch(() => {
        setLoading(false);
        close();
      });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.target as typeof event.target & {
      channelName: { value: string };
      slackDomain: { value: string };
    };
    const channelName = form.channelName.value;
    updateChannel({
      accountId: currentCommunity.id,
      channelId: channel.id,
      channelName,
    });
  }
  return (
    <Modal open={open} close={close}>
      <form onSubmit={onSubmit}>
        <div className={styles.header}>
          <H3>Edit Channel</H3>
          <Icon onClick={close}>
            <FiX />
          </Icon>
        </div>
        <Label htmlFor="channelName">Name</Label>
        <TextInput
          id="channelName"
          required
          type="text"
          icon={<FiHash />}
          defaultValue={channel.channelName}
        />
        <div className={styles.p2}></div>
        <Label htmlFor="channelPrivate">Private</Label>
        <Toggle
          onChange={(checked) => setChannelPrivate(checked)}
          checked={channelPrivate}
        />
        <div className={styles.p2}></div>
        <Button type="submit" disabled={loading}>
          Save
        </Button>
      </form>
    </Modal>
  );
}
