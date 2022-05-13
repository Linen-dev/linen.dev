import { channels } from '@prisma/client';
import Button from '../../../Button';
import { Checkbox } from '@mantine/core';
import { useState } from 'react';
import { toast } from '@/components/Toast';

interface Props {
  channels: channels[];
}

function toObject(channels: channels[]) {
  let obj: any = {};
  for (const channel of channels) {
    obj[channel.id] = channel.hidden;
  }
  return obj;
}

export default function ChannelVisibilityToggle({ channels }: Props) {
  const [hidden, setHidden] = useState(toObject(channels));

  const onCheckChannelHidden = (channelId: any, checked: boolean) => {
    setHidden({ ...hidden, [channelId]: checked });
  };

  const rows = channels.map((channel, channelIdx) => (
    <Checkbox
      key={channelIdx}
      checked={hidden[channel.id]}
      label={channel.channelName}
      onChange={(event) =>
        onCheckChannelHidden(channel.id, event.currentTarget.checked)
      }
    />
  ));

  const onSubmit = (event: any) => {
    event.preventDefault();
    console.log(hidden, channels);
    const requestChange = channels.map((channel) => ({
      id: channel.id,
      hidden: hidden[channel.id],
    }));
    fetch('/api/channels', {
      method: 'PUT',
      body: JSON.stringify({ channels: requestChange }),
    })
      .then((response) => response.json())
      .then(() => {
        toast.success('Saved Successfully');
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <fieldset className="space-y-2">
        <legend className="text-lg font-medium text-gray-900">
          Hidden Channels
        </legend>
        {rows}
        <Button type="submit">Update</Button>
      </fieldset>
    </form>
  );
}
