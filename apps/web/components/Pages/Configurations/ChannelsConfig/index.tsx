import React from 'react';
import Toast from '@linen/ui/Toast';
import { SerializedAccount } from '@linen/types';

import NativeSelect from '@linen/ui/NativeSelect';
import * as api from 'utilities/requests';

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
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Hide new channels
        </h3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-gray-500">
            <p>
              Makes all new channels hidden by default even if they are public.
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
