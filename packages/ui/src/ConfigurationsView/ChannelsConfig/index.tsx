import React from 'react';
import Toast from '@/Toast';
import Label from '@/Label';
import { SerializedAccount } from '@linen/types';
import NativeSelect from '@/NativeSelect';
import type { ApiClient } from '@linen/api-client';

interface Props {
  currentCommunity: SerializedAccount;
  api: ApiClient;
}

export default function ChannelsConfig({ currentCommunity, api }: Props) {
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
    <>
      <Label htmlFor="hide-new-channels">
        Hide new channels
        <Label.Description>
          Makes all new channels hidden by default even if they are public in
          Slack or Discord.
        </Label.Description>
      </Label>
      <NativeSelect
        style={{ width: 'auto' }}
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
    </>
  );
}
