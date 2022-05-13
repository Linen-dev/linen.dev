import { channels } from '@prisma/client';
import { useState } from 'react';
import { Select } from '@mantine/core';
import { toast } from 'components/Toast';

interface Props {
  channels?: channels[];
}

function findDefaultChannel(channels?: channels[]) {
  return channels?.find((channel) => !!channel.default)?.id;
}

export default function ChannelSetDefault({ channels }: Props) {
  const [defaultChannelId, setDefaultChannelId] = useState(
    findDefaultChannel(channels)
  );

  async function onDefaultChannelChange(newDefaultChannelId: string) {
    if (defaultChannelId === newDefaultChannelId) return; // nothing to do
    console.log({ defaultChannelId, newDefaultChannelId });

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
        toast.success('Saved successfully!');
      });
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-lg font-medium text-gray-900">
        Default Channel
      </legend>
      <div>
        <Select
          value={defaultChannelId}
          onChange={onDefaultChannelChange}
          data={
            channels
              ? channels.map((c) => ({ value: c.id, label: c.channelName }))
              : []
          }
          placeholder="Pick one"
          required
        />
      </div>
    </fieldset>
  );
}
