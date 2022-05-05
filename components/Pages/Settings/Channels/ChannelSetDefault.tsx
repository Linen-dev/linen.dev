import { channels } from '@prisma/client';
import { useState } from 'react';

interface Props {
  channels?: channels[];
}

function findDefaultChannel(channels?: channels[]) {
  return channels?.find((channel) => !!channel.default)?.id || '';
}

export default function ChannelSetDefault({ channels }: Props) {
  const [defaultChannelId, setDefaultChannelId] = useState(
    findDefaultChannel(channels)
  );

  const options = channels?.map((channel, channelIdx) => (
    <option key={channelIdx} value={channel.id}>
      {channel.channelName}
    </option>
  ));

  async function onDefaultChannelChange(event: any) {
    event.preventDefault();
    const newDefaultChannelId = event.target.value;
    if (defaultChannelId === newDefaultChannelId) return; // nothing to do

    fetch('/api/channels/default', {
      method: 'PUT',
      body: JSON.stringify({
        channelId: newDefaultChannelId,
        originalChannelId: defaultChannelId,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setDefaultChannelId(newDefaultChannelId);
        alert('Saved successfully!');
      });
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-lg font-medium text-gray-900">
        Default Channel
      </legend>
      <div>
        <select
          id="default"
          name="default"
          onChange={onDefaultChannelChange}
          value={defaultChannelId}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option disabled value={''}>
            Select a channel
          </option>
          {options}
        </select>
      </div>
    </fieldset>
  );
}
