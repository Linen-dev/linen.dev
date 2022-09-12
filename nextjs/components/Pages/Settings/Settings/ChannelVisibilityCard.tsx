import React from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import { SettingsProps, WaitForIntegration } from '..';
import { channels } from '@prisma/client';
import { toast } from 'components/Toast';
import Toggle from 'components/Toggle';

function ChannelToggleList({
  channel,
  onChange,
}: {
  channel: channels;
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

function ChannelVisibilityCardComponent({
  channels,
  onChange,
  hasAuth,
}: {
  channels?: channels[];
  onChange: (event: any) => Promise<void>;
  hasAuth?: boolean;
}) {
  return (
    <div className="bg-white">
      <div className="px-4 py-5 sm:p-6">
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
          {hasAuth ? '' : <WaitForIntegration />}
        </div>
      </div>
    </div>
  );
}

export default function ChannelVisibilityCard({
  channels,
  account,
}: SettingsProps) {
  async function onChange(value: any) {
    return fetch('/api/channels', {
      method: 'PUT',
      body: JSON.stringify({ channels: [value] }),
    })
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
      })
      .catch(() => toast.error('Something went wrong. Please try again.'));
  }

  return (
    <ChannelVisibilityCardComponent
      channels={channels}
      hasAuth={account?.hasAuth}
      onChange={onChange}
    />
  );
}
