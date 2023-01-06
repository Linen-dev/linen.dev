import React from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import { Toast } from '@linen/ui';
import { SerializedAccount, SerializedChannel } from '@linen/types'
import Toggle from 'components/Toggle';

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
    <div className="flex m-1">
      <Toggle
        checked={enabled}
        onChange={(checked) => onChannelToggle(checked, channel.id)}
      />
      <span
        className={classNames(
          'text-sm font-medium ml-2',
          enabled ? 'text-gray-900' : 'text-gray-400 line-through	'
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
      body: JSON.stringify({ communityId: currentCommunity?.id, channels: [value] }),
    })
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
      })
      .catch(() => Toast.error('Something went wrong. Please try again.'));
  }

  return (
    <div className="bg-white">
      <div className="py-3">
        <div className="flex">
          <div className="grow">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Channels visibility
            </h3>
            <div className="mt-2 sm:flex sm:items-start sm:justify-between">
              <div className="max-w-xl text-sm text-gray-500">
                <p>Pick which channels to display or hide.</p>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:items-end sm:justify-between">
              <div className="flex-grow">
                {channels?.map((channel) => {
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
        </div>
      </div>
    </div>
  );
}
