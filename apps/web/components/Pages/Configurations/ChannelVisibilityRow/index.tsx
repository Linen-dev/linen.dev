import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  SerializedAccount,
  findChannelsWithStats,
  SerializedChannel,
} from '@linen/types';
import Toast from '@linen/ui/Toast';
import Toggle from '@linen/ui/Toggle';
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
    <div className="flex">
      <div className="grow">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Channels visibility
        </h3>
        <div>
          <div className="text-sm text-gray-500">
            <p>Pick which channels to display or hide.</p>
          </div>
        </div>
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
      </div>
    </div>
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
