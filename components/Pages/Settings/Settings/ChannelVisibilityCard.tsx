import React from 'react';
import { useState } from 'react';
import { Switch } from '@headlessui/react';
import classNames from 'classnames';
import { SettingsProps, WaitForIntegration } from '..';
import { channels } from '@prisma/client';
import { toast } from 'components/Toast';

function ChannelToggleList({
  channel,
  onChange,
}: {
  channel: channels;
  onChange: (event: any) => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(!channel.hidden);

  async function onChannelToggle(value: boolean, id: string) {
    await onChange({ id, hidden: String(value) === 'false' });
    setEnabled(value);
  }

  return (
    <Switch.Group as="div" className="flex items-center justify-between m-1">
      <span className="flex-grow flex flex-col">
        <Switch.Label
          as="span"
          className={classNames(
            'text-sm font-medium ',
            enabled ? 'text-gray-900' : 'text-gray-400 line-through	'
          )}
          passive
        >
          {channel.channelName}
        </Switch.Label>
      </span>
      <Switch
        checked={enabled}
        onChange={(value) => onChannelToggle(value, channel.id)}
        className={classNames(
          enabled ? 'bg-blue-700' : 'bg-gray-200',
          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300'
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
          )}
        />
      </Switch>
      <input
        type="hidden"
        name={channel.id}
        value={enabled ? 'true' : 'false'}
      />
    </Switch.Group>
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
    <div className="bg-white shadow sm:rounded-lg">
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
    console.log('value', value);
    return fetch('/api/channels', {
      method: 'PUT',
      body: JSON.stringify({ channels: [value] }),
    })
      .then((response) => {
        if (response.ok) {
          toast.success('Saved Successfully');
        } else {
          throw response;
        }
      })
      .catch(() => toast.error('Something went wrong'));
  }

  return (
    <ChannelVisibilityCardComponent
      channels={channels}
      hasAuth={account?.hasAuth}
      onChange={onChange}
    />
  );
}
