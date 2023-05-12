import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  SerializedAccount,
  findChannelsWithStats,
  SerializedChannel,
} from '@linen/types';
import Toast from '@linen/ui/Toast';
import Toggle from '@linen/ui/Toggle';
import Label from '@linen/ui/Label';
import styles from './index.module.scss';
import { api } from 'utilities/requests';
import debounce from '@linen/utilities/debounce';

interface Props {
  onChange: React.Dispatch<React.SetStateAction<SerializedChannel[]>>;
  currentCommunity: SerializedAccount;
}

export default function ChannelVisibilityRow({
  currentCommunity,
  onChange,
}: Props) {
  const { data } = useChannelsStats(currentCommunity.id);
  const [allChannels, setAllChannels] = useState<findChannelsWithStats>();

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
      communityId: currentCommunity.id,
      value,
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
                    <label className="text-xs text-gray-400 italic">
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

const useChannelsStats = (accountId: string) => {
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

const debouncedChannelsVisibilityUpdate = debounce(
  ({
    communityId,
    value,
  }: {
    communityId: string;
    value: { id: string; hidden: boolean };
  }) => api.hideChannels({ accountId: communityId, channels: [value] })
);
