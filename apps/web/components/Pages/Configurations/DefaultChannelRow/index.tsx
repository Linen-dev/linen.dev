import React, { useState } from 'react';
import Toast from '@linen/ui/Toast';
import { SerializedAccount, SerializedChannel } from '@linen/types';
import DiscordIcon from '@linen/ui/DiscordIcon';
import SlackIcon from '@linen/ui/SlackIcon';
import NativeSelect from '@linen/ui/NativeSelect';
import H3 from '@linen/ui/H3';
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
    <div className="flex">
      <div className="grow">
        <H3>Default channel</H3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-gray-500">
            <p>
              Select the first channel that gets displayed when a user lands on
              your Linen page.
            </p>
          </div>
        </div>
      </div>
      <div className="self-center">
        <NativeSelect
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
      </div>
    </div>
  );
}
