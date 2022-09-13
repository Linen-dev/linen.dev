import React from 'react';
import { useLinkContext } from 'contexts/Link';
import { channels } from '@prisma/client';
import NativeSelect from 'components/NativeSelect';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import { AiOutlineNumber } from 'react-icons/ai';

interface Props {
  value: string;
  channels: channels[];
}

export default function ChannelSelect({ value, channels }: Props) {
  const { isSubDomainRouting, communityName, communityType } = useLinkContext();
  const onChangeChannel = (channelSelected: string) => {
    if (value && value !== channelSelected) {
      CustomRouterPush({
        isSubDomainRouting: isSubDomainRouting,
        communityName,
        communityType,
        path: `/c/${channelSelected}`,
      });
    }
  };

  return (
    <NativeSelect
      id="channel"
      options={channels.map((channel: channels) => ({
        label: channel.channelName,
        value: channel.channelName,
      }))}
      icon={<AiOutlineNumber />}
      onChange={(event) => onChangeChannel(event.currentTarget.value)}
      label="Channels"
      value={value}
    />
  );
}
