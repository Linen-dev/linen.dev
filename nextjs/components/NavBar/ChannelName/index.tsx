import React from 'react';
import { Text } from '@mantine/core';

interface Props {
  channelName: string;
  isChannelActive: boolean;
}

export default function ChannelName({ channelName, isChannelActive }: Props) {
  return (
    <Text
      className="hover:bg-gray-50 px-4 py-2"
      size="sm"
      weight={isChannelActive ? 700 : 500}
      sx={() => ({
        cursor: 'pointer',
        width: '100%',
        backgroundColor: 'white',
        color: isChannelActive ? '#1B194E' : 'black',
        borderLeft: `3px solid ${isChannelActive ? '#1B194E' : 'transparent'}`,
        '&:hover': {
          color: '#1B194E',
        },
      })}
    >
      # {channelName}
    </Text>
  );
}
