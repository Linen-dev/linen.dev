import React, { useState, Fragment } from 'react';
import { GoCheck, GoChevronDown } from 'react-icons/go';
import { Listbox, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { SettingsProps, WaitForIntegration } from '..';
import { toast } from 'components/Toast';
import { channels } from '@prisma/client';
import DiscordIcon from 'components/icons/DiscordIcon';
import SlackIcon from 'components/icons/SlackIcon';

type DropDownChannelsProps = {
  channels?: channels[];
  selected?: channels;
  onChange: (channel: channels) => void;
  hasAuth?: boolean;
  CommunityIcon: any;
};

function DropDownChannels({
  channels,
  selected,
  onChange,
  CommunityIcon,
}: DropDownChannelsProps) {
  return (
    <Listbox value={selected} onChange={onChange}>
      {({ open }) => (
        <>
          <Listbox.Label className="sr-only">
            Change published status
          </Listbox.Label>
          <div className="relative">
            <div className="inline-flex shadow-sm rounded-md divide-x divide-blue-700">
              <div className="relative z-0 inline-flex shadow-sm rounded-md divide-x divide-blue-700">
                <div className="relative inline-flex items-center bg-blue-700 py-2 pl-3 pr-4 border border-transparent rounded-l-md shadow-sm text-white">
                  <CommunityIcon color="#eee" />
                  <p className="ml-2.5 text-sm font-medium">
                    {selected?.channelName || 'choose one'}
                  </p>
                </div>
                <Listbox.Button className="relative inline-flex items-center bg-blue-700 p-2 rounded-l-none rounded-r-md text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:z-10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-300">
                  <span className="sr-only">Change default channel</span>
                  <GoChevronDown className="h-5 w-5 text-white" />
                </Listbox.Button>
              </div>
            </div>
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="origin-top-right absolute z-10 right-0 mt-2 w-72 rounded-md shadow-lg overflow-hidden bg-white divide-y divide-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none">
                {channels?.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    className={({ active }) =>
                      classNames(
                        active ? 'text-white bg-blue-700' : 'text-gray-900',
                        'cursor-default select-none relative p-2 text-sm'
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <p
                            className={
                              selected ? 'font-semibold' : 'font-normal'
                            }
                          >
                            {option.channelName}
                          </p>
                          {selected ? (
                            <span
                              className={
                                active ? 'text-white' : 'text-blue-600'
                              }
                            >
                              <GoCheck className="h-5 w-5" />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}

function ChannelsDefaultComponent({
  channels,
  onChange,
  selected,
  hasAuth,
  CommunityIcon,
}: DropDownChannelsProps) {
  return (
    <div className="bg-white">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex">
          <div className="grow">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Default channel
            </h3>
            <div className="mt-2 sm:flex sm:items-start sm:justify-between">
              <div className="max-w-xl text-sm text-gray-500">
                <p>
                  Select the first channel that gets displayed when a user lands
                  on your Linen page.
                </p>
              </div>
            </div>
          </div>
          <div className="self-center">
            {hasAuth ? (
              <DropDownChannels
                channels={channels}
                selected={selected}
                onChange={onChange}
                CommunityIcon={CommunityIcon}
              />
            ) : (
              <WaitForIntegration />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChannelsDefault({ channels, account }: SettingsProps) {
  const [defaultChannel, setDefaultChannel] = useState(
    channels?.find((channel) => channel.default)
  );
  const [selected, setSelected] = useState(defaultChannel);

  const CommunityIcon =
    account?.communityType === 'discord' ? DiscordIcon : SlackIcon;

  async function onDefaultChannelChange(channelSelected: channels) {
    if (defaultChannel?.id === channelSelected.id) {
      return; // nothing to do
    }
    fetch('/api/channels/default', {
      method: 'PUT',
      body: JSON.stringify({
        communityId: account?.id,
        channelId: channelSelected?.id,
        originalChannelId: defaultChannel?.id,
      }),
    })
      .then((response) => {
        if (response.ok) {
          setDefaultChannel(channelSelected);
          setSelected(channelSelected);
          toast.success('Saved successfully!');
        } else {
          toast.error('Something went wrong!');
        }
      })
      .catch(() => toast.error('Something went wrong'));
  }

  return (
    <ChannelsDefaultComponent
      onChange={onDefaultChannelChange}
      selected={selected}
      channels={channels}
      hasAuth={!!account}
      CommunityIcon={CommunityIcon}
    />
  );
}
