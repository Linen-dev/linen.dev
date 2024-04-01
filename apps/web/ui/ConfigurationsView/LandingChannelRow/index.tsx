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
  onChange(id: string): void;
}

function getInitialChannel(channels?: SerializedChannel[]) {
  if (!channels || channels.length === 0) {
    return;
  }
  return (
    channels.find((channel) => channel.landing) ||
    channels.find((channel) => channel.default) ||
    channels[0]
  );
}

export default function LandingChannelRow({
  channels,
  currentCommunity,
  api,
  onChange,
}: Props) {
  const [landingChannel, setLandingChannel] = useState(
    getInitialChannel(channels)
  );

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const id = event.currentTarget.value;
    const selectedChannel = channels?.find(
      (channel) => channel.id === id
    ) as SerializedChannel;
    if (selectedChannel && selectedChannel.id !== landingChannel?.id) {
      onChange(id);
      return api
        .setLandingChannel({
          accountId: currentCommunity.id,
          channelId: selectedChannel?.id,
        })
        .then((_) => {
          setLandingChannel(selectedChannel);
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
      <Label htmlFor="landingChannel">
        Landing channel
        <Label.Description>
          Select the channel that gets displayed when a user lands on your Linen
          page.
        </Label.Description>
      </Label>
      <NativeSelect
        style={{ width: 'auto' }}
        id="default-channel-integration-select"
        icon={<FiHash color="#fff" />}
        theme="blue"
        defaultValue={landingChannel?.id}
        onChange={handleChange}
        options={channels
          .filter((channel) => channel.default)
          .map((channel) => ({
            label: channel.channelName,
            value: channel.id,
          }))}
      />
    </>
  );
}
