import React, { useState } from 'react';
import Toast from '@/Toast';
import type { SerializedAccount, SerializedChannel } from '@linen/types';
import NativeSelect from '@/NativeSelect';
import Label from '@/Label';
import type { ApiClient } from '@linen/api-client';
import { FiHash } from '@react-icons/all-files/fi/FiHash';

interface Props {
  channels?: SerializedChannel[];
  currentCommunity: SerializedAccount;
  api: ApiClient;
}

export default function DefaultChannelRow({
  channels,
  currentCommunity,
  api,
}: Props) {
  const [defaultChannel, setDefaultChannel] = useState(
    channels?.find((channel) => channel.default)
  );

  async function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const id = event.currentTarget.value;
    const selectedChannel = channels?.find(
      (channel) => channel.id === id
    ) as SerializedChannel;
    if (selectedChannel && selectedChannel.id !== defaultChannel?.id) {
      return api
        .setDefaultChannel({
          accountId: currentCommunity.id,
          channelIds: [selectedChannel?.id],
        })
        .then((_) => {
          setDefaultChannel(selectedChannel);
          Toast.success('Saved successfully!');
        })
        .catch(() => Toast.error('Something went wrong'));
    }
  }

  if (!channels) {
    return <>Loading...</>;
  }

  return (
    <>
      <Label htmlFor="defaultChannel">
        Default channel
        <Label.Description>
          Select the first channel that gets displayed when a user lands on your
          Linen page.
        </Label.Description>
      </Label>
      <NativeSelect
        style={{ width: 'auto' }}
        id="default-channel-integration-select"
        icon={<FiHash color="#fff" />}
        theme="blue"
        defaultValue={defaultChannel?.id}
        onChange={onChange}
        options={channels?.map((channel) => ({
          label: channel.channelName,
          value: channel.id,
        }))}
      />
    </>
  );
}
