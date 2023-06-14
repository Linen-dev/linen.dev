import React, { useState } from 'react';
import classNames from 'classnames';
import {
  SerializedAccount,
  findChannelsWithStats,
  SerializedChannel,
} from '@linen/types';
import Toast from '@/Toast';
import Toggle from '@/Toggle';
import Label from '@/Label';
import styles from './index.module.scss';
import debounce from '@linen/utilities/debounce';
import type { ApiClient } from '@linen/api-client';

interface Props {
  allChannels?: findChannelsWithStats;
  currentCommunity: SerializedAccount;
  api: ApiClient;
  setChannels: (props: SerializedChannel[]) => void;
  channels: SerializedChannel[];
}

export default function ChannelVisibilityRow({
  currentCommunity,
  api,
  ...props
}: Props) {
  const [allChannels, setAllChannels] = useState<
    findChannelsWithStats | undefined
  >(props.allChannels);

  const debouncedChannelsVisibilityUpdate = debounce(api.hideChannels);

  async function onChannelsVisibilityChange(value: {
    id: string;
    hidden: boolean;
  }) {
    setAllChannels((channels) => {
      return channels?.map((channel) => {
        if (channel.id === value.id) {
          return {
            ...channel,
            hidden: value.hidden,
          };
        }
        return channel;
      });
    });

    props.setChannels(
      props.channels.map((channel) => {
        if (channel.id === value.id) {
          return {
            ...channel,
            hidden: value.hidden,
          };
        }
        return channel;
      })
    );

    return debouncedChannelsVisibilityUpdate({
      accountId: currentCommunity.id,
      channels: [value],
    }).catch(() => Toast.error('Something went wrong. Please try again.'));
  }

  return (
    <>
      <Label htmlFor="channels-visibility">
        Channels visibility
        <Label.Description>
          Pick which channels to display or hide.
        </Label.Description>
      </Label>
      <div className={styles.toggles}>
        {!allChannels
          ? 'Loading...'
          : allChannels.map((channel) => {
              const enabled = !channel.hidden;

              async function onChannelToggle(checked: boolean, id: string) {
                await onChannelsVisibilityChange({ id, hidden: !checked });
              }

              return (
                <div className={styles.toggle} key={channel.id}>
                  <label
                    className={classNames(
                      styles.label,
                      enabled ? styles.enabled : styles.disabled
                    )}
                  >
                    <Toggle
                      checked={enabled}
                      onChange={(checked: boolean) =>
                        onChannelToggle(checked, channel.id)
                      }
                    />
                    <div
                      className={classNames(styles.channel, {
                        [styles.lock]: channel.type === 'PRIVATE',
                        [styles.hash]: channel.type === 'PUBLIC',
                      })}
                    >
                      {channel.channelName}
                      <label className={styles.channelsStats}>
                        {channel.stats}
                      </label>
                    </div>
                  </label>

                  <input
                    type="hidden"
                    name={channel.id}
                    value={enabled ? 'true' : 'false'}
                  />
                </div>
              );
            })}
      </div>
    </>
  );
}
