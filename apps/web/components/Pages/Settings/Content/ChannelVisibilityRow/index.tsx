import React from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import { Toast } from '@linen/ui';
import { SerializedAccount, SerializedChannel } from '@linen/types';
import Toggle from 'components/Toggle';
import styles from './index.module.scss';

function ChannelToggleList({
  channel,
  onChange,
}: {
  channel: SerializedChannel;
  onChange: (event: any) => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(!channel.hidden);

  async function onChannelToggle(checked: boolean, id: string) {
    await onChange({ id, hidden: !checked });
    setEnabled(checked);
  }

  return (
    <div className={styles.toggle}>
      <Toggle
        checked={enabled}
        onChange={(checked) => onChannelToggle(checked, channel.id)}
      />
      <span
        className={classNames(
          styles.text,
          enabled ? styles.enabled : styles.disabled
        )}
      >
        {channel.channelName}
      </span>

      <input
        type="hidden"
        name={channel.id}
        value={enabled ? 'true' : 'false'}
      />
    </div>
  );
}

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
}

export default function ChannelVisibilityRow({
  channels,
  currentCommunity,
}: Props) {
  async function onChange(value: any) {
    return fetch('/api/channels', {
      method: 'PUT',
      body: JSON.stringify({
        communityId: currentCommunity?.id,
        channels: [value],
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
      })
      .catch(() => Toast.error('Something went wrong. Please try again.'));
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
          {channels
            ?.sort((channel1, channel2) => {
              return channel1.channelName.localeCompare(channel2.channelName);
            })
            .map((channel) => {
              return (
                <ChannelToggleList
                  key={channel.id}
                  channel={channel}
                  onChange={onChange}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
