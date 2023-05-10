import React from 'react';
import Toast from '@linen/ui/Toast';
import H3 from '@linen/ui/H3';
import { SerializedAccount } from '@linen/types';
import NativeSelect from '@linen/ui/NativeSelect';
import { api } from 'utilities/requests';

interface Props {
  currentCommunity: SerializedAccount;
}

export default function ChannelsConfig({ currentCommunity }: Props) {
  const onSubmit = (target: { id: string; value: string }) => {
    if (!target.id || !target.value) return;
    if (
      target.id in currentCommunity &&
      // @ts-ignore
      currentCommunity[target.id] === target.value
    )
      return;
    api
      .updateAccount({
        accountId: currentCommunity.id,
        [target.id]: target.value,
      })
      .then((_) => {
        // @ts-ignore
        currentCommunity[target.id] = target.value;
      })
      .catch(() => {
        Toast.error('Something went wrong!');
      });
  };

  return (
    <div className="flex">
      <div className="grow">
        <H3>Hide new channels</H3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-gray-500 dark:text-gray-300">
            <p>
              Makes all new channels hidden by default even if they are public
              in Slack or Discord.
            </p>
          </div>
        </div>
      </div>
      <div className="self-center">
        <NativeSelect
          id="newChannelsConfig"
          theme="blue"
          defaultValue={currentCommunity.newChannelsConfig || 'NOT_HIDDEN'}
          onChange={(e: any) => onSubmit(e.target)}
          options={[
            {
              label: 'Hidden',
              value: 'HIDDEN',
            },
            {
              label: 'Visible',
              value: 'NOT_HIDDEN',
            },
          ]}
        />
      </div>
    </div>
  );
}
