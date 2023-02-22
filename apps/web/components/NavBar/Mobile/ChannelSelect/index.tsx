import React from 'react';
import classNames from 'classnames';
import { useLinkContext } from '@linen/contexts/Link';
import { SerializedChannel } from '@linen/types';
import { Label, NativeSelect } from '@linen/ui';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
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
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
          onChangeChannel(event.currentTarget.value)
        }
        value={value}
      />
    </div>
  );
}
