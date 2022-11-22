import React from 'react';
import classNames from 'classnames';
import { useLinkContext } from 'contexts/Link';
import { SerializedChannel } from '@linen/types';
import NativeSelect from 'components/NativeSelect';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import { FiHash } from 'react-icons/fi';
import Label from 'components/Label';
import styles from './index.module.scss';

interface Props {
  className?: string;
  value: string;
  channels: SerializedChannel[];
}

export default function ChannelSelect({ className, value, channels }: Props) {
  const { isSubDomainRouting, communityName, communityType } = useLinkContext();
  const onChangeChannel = (channelSelected: string) => {
    if (channelSelected && value !== channelSelected) {
      CustomRouterPush({
        isSubDomainRouting: isSubDomainRouting,
        communityName,
        communityType,
        path: `/c/${channelSelected}`,
      });
    }
  };

  const options = [
    ...channels.map((channel: SerializedChannel) => ({
      label: channel.channelName,
      value: channel.channelName,
    })),
  ];

  if (!value) {
    options.unshift({
      label: 'channel',
      value: '',
    });
  }

  return (
    <div className={className}>
      <Label className={styles.label} htmlFor="channel">
        Channels
      </Label>
      <NativeSelect
        className={classNames(styles.select, {
          [styles.active]: value,
          [styles.empty]: !value,
        })}
        id="channel"
        options={options}
        icon={<FiHash />}
        onChange={(event) => onChangeChannel(event.currentTarget.value)}
        value={value}
      />
    </div>
  );
}
