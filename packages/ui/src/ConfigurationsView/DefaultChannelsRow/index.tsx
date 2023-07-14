import React, { useCallback } from 'react';
import classNames from 'classnames';
import Toast from '@/Toast';
import Toggle from '@/Toggle';
import type { SerializedAccount, SerializedChannel } from '@linen/types';
import Label from '@/Label';
import type { ApiClient } from '@linen/api-client';
import styles from './index.module.scss';
import debounce from '@linen/utilities/debounce';

interface Props {
  channels?: SerializedChannel[];
  currentCommunity: SerializedAccount;
  api: ApiClient;
  onChange({ id, checked }: { id: string; checked: boolean }): void;
}

export default function DefaultChannelsRow({
  channels,
  currentCommunity,
  api,
  onChange,
}: Props) {
  const debouncedSetDefaultChannels = useCallback(
    debounce(api.setDefaultChannels),
    []
  );

  async function onToggle({ id, checked }: { id: string; checked: boolean }) {
    if (!channels) {
      return;
    }
    onChange({ id, checked });
    return debouncedSetDefaultChannels({
      accountId: currentCommunity.id,
      channelIds: channels
        .filter((channel) => {
          if (channel.id === id) {
            return checked;
          }
          return channel.default;
        })
        .map(({ id }) => id),
    }).catch(() => Toast.error('Something went wrong. Please try again.'));
  }

  if (!channels) {
    return <>Loading...</>;
  }

  return (
    <>
      <Label htmlFor="defaultChannel">
        Default channels
        <Label.Description>
          Select channels which are shown to new members.
        </Label.Description>
      </Label>
      <div className={styles.toggles}>
        {!channels
          ? 'Loading...'
          : channels.map((channel) => {
              const enabled = channel.default;

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
                        onToggle({ id: channel.id, checked })
                      }
                    />
                    <div
                      className={classNames(styles.channel, {
                        [styles.lock]: channel.type === 'PRIVATE',
                        [styles.hash]: channel.type === 'PUBLIC',
                      })}
                    >
                      {channel.channelName}
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
