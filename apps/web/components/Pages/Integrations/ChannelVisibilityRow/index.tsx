import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { SerializedAccount, SerializedChannel } from '@linen/types';
import { Toggle } from '@linen/ui';
import styles from './index.module.scss';
import { getChannelsStats } from 'utilities/requests';

interface Props {
  channels: SerializedChannel[];
  onChange: (event: any) => Promise<void>;
  currentCommunity: SerializedAccount;
}

export default function ChannelVisibilityRow({
  channels,
  onChange,
  currentCommunity,
}: Props) {
  const { data } = useChannelsStats(currentCommunity.id);

  function getStats(id: string) {
    return data?.find((d) => d.id === id)?.stats || 'loading stats...';
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
          {channels.map((channel) => {
            const enabled = !channel.hidden;

            async function onChannelToggle(checked: boolean, id: string) {
              await onChange({ id, hidden: !checked });
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
                    {getStats(channel.id)}
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
  const [value, setValue] = useState<
    | {
        stats: string;
        id: string;
      }[]
    | null
  >(null);

  const execute = useCallback(async () => {
    setValue(null);
    try {
      const response = await getChannelsStats({ accountId });
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
