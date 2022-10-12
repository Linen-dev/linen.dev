import React from 'react';
import type { ChannelSerialized } from 'lib/channel';
import ChannelSelect from './ChannelSelect';

interface Props {
  channelName: string;
  channels: ChannelSerialized[];
}

export default function MobileNavBar({ channels, channelName }: Props) {
  return (
    <div
      className="py-1"
      style={{
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px #e5e7eb',
      }}
    >
      <ChannelSelect channels={channels} value={channelName} />
    </div>
  );
}
