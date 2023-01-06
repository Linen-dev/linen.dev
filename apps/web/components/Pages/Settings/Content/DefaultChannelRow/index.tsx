import React, { useState } from 'react';
import { Toast } from '@linen/ui';
import { SerializedAccount, SerializedChannel } from '@linen/types';
import DiscordIcon from 'components/icons/DiscordIcon';
import SlackIcon from 'components/icons/SlackIcon';
import { NativeSelect } from '@linen/ui';

interface Props {
  channels: SerializedChannel[],
  currentCommunity: SerializedAccount
}

export default function DefaultChannelRow({ channels, currentCommunity }: Props) {
  const [defaultChannel, setDefaultChannel] = useState(
    channels.find((channel) => channel.default)
  );
  const [selected, setSelected] = useState(defaultChannel);

  const CommunityIcon =
    currentCommunity.communityType === 'discord' ? DiscordIcon : SlackIcon;

  async function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const id = event.currentTarget.value
    const channelSelected = channels.find((channel) => channel.id === id) as SerializedChannel
    if (channelSelected && channelSelected.id !== defaultChannel?.id) {
      return fetch('/api/channels/default', {
        method: 'PUT',
        body: JSON.stringify({
            communityId: currentCommunity.id,
            channelId: channelSelected?.id,
            originalChannelId: defaultChannel?.id,
          }),
        })
          .then((response) => {
            if (response.ok) {
              setDefaultChannel(channelSelected);
              setSelected(channelSelected);
              Toast.success('Saved successfully!');
            } else {
              Toast.error('Something went wrong!');
            }
          })
          .catch(() => Toast.error('Something went wrong'));
    }
    
  }

  return (
    <div className="bg-white">
      <div className="py-3">
        <div className="flex">
          <div className="grow">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Default channel
            </h3>
            <div className="mt-2 sm:flex sm:items-start sm:justify-between">
              <div className="max-w-xl text-sm text-gray-500">
                <p>
                  Select the first channel that gets displayed when a user lands
                  on your Linen page.
                </p>
              </div>
            </div>
          </div>
          <div className="self-center">
            <NativeSelect
              icon={<CommunityIcon color='#fff' />}
              theme='blue'
              defaultValue={selected}
              onChange={onChange}
              options={channels?.map(channel => ({ label: channel.channelName, value: channel.id }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
