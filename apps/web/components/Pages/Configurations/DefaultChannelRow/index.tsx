import React, { useState } from 'react';
import Toast from '@linen/ui/Toast';
import { SerializedAccount, SerializedChannel } from '@linen/types';
import DiscordIcon from '@linen/ui/DiscordIcon';
import SlackIcon from '@linen/ui/SlackIcon';
import NativeSelect from '@linen/ui/NativeSelect';
import Label from '@linen/ui/Label';
import { api } from 'utilities/requests';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
}

export default function DefaultChannelRow({
  channels,
  currentCommunity,
}: Props) {
  const [defaultChannel, setDefaultChannel] = useState(
    channels.find((channel) => channel.default)
  );
  const [selected, setSelected] = useState(defaultChannel);

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
          setSelected(channelSelected);
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
        defaultValue={selected?.id}
        onChange={onChange}
        options={channels?.map((channel) => ({
          label: channel.channelName,
          value: channel.id,
        }))}
      />
    </>
  );
}
