import React, { useState } from 'react';
import Toast from '@/Toast';
import type { SerializedAccount, SerializedChannel } from '@linen/types';
import DiscordIcon from '@/DiscordIcon';
import SlackIcon from '@/SlackIcon';
import NativeSelect from '@/NativeSelect';
import Label from '@/Label';
import type { ApiClient } from '@linen/api-client';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  defaultChannel?: SerializedChannel;
  api: ApiClient;
}

export default function DefaultChannelRow({
  channels,
  currentCommunity,
  api,
  defaultChannel: initialChannel,
}: Props) {
  const [defaultChannel, setDefaultChannel] = useState(initialChannel);

  const CommunityIcon =
    currentCommunity.communityType === 'discord' ? DiscordIcon : SlackIcon;

  async function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const id = event.currentTarget.value;
    const channelSelected = channels.find(
      (channel) => channel.id === id
    ) as SerializedChannel;
    if (channelSelected && channelSelected.id !== defaultChannel?.id) {
      return api
        .setDefaultChannel({
          accountId: currentCommunity.id,
          channelId: channelSelected?.id,
          originalChannelId: defaultChannel?.id,
        })
        .then((_) => {
          setDefaultChannel(channelSelected);
          Toast.success('Saved successfully!');
        })
        .catch(() => Toast.error('Something went wrong'));
    }
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
        icon={<CommunityIcon color="#fff" />}
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
