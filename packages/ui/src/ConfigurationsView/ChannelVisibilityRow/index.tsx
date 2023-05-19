import React, { useCallback, useEffect, useState } from 'react';
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
  onChange(channels: SerializedChannel[]): void;
  currentCommunity: SerializedAccount;
  api: ApiClient;
}

export default function ChannelVisibilityRow({
  currentCommunity,
  onChange,
  api,
}: Props) {
  const { data } = useChannelsStats({ accountId: currentCommunity.id, api });
  const [allChannels, setAllChannels] = useState<findChannelsWithStats>();

  const debouncedChannelsVisibilityUpdate = debounce(api.hideChannels);

  useEffect(() => {
    setAllChannels(data);
  }, [data]);

  useEffect(() => {
    if (allChannels) {
      onChange(allChannels.filter((c) => !c.hidden));
    }
  }, [allChannels, onChange]);

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
                    {channel.channelName}{' '}
                    <label className={styles.channelsStats}>
                      {channel.stats}
                    </label>
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

const useChannelsStats = ({
  accountId,
  api,
}: {
  accountId: string;
  api: ApiClient;
}) => {
  const [value, setValue] = useState<findChannelsWithStats>();

  const execute = useCallback(async () => {
    setValue(undefined);
    try {
      const response = await api.getChannelsStats({ accountId });
      setValue(response);
    } catch (error: any) {
      console.error(error);
    }
  }, [accountId]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data: value };
};
