import React, { useState } from 'react';
import Toast from '@/Toast';
import Toggle from '@/Toggle';
import Label from '@/Label';
import NativeSelect from '@/NativeSelect';
import { SerializedAccount, AnonymizeType } from '@linen/types';
import type { ApiClient } from '@linen/api-client';

interface Props {
  currentCommunity: SerializedAccount;
  api: ApiClient;
}

export default function AnonymizeCard({ currentCommunity, api }: Props) {
  const [anonymize, setAnonymize] = useState(currentCommunity.anonymize);

  async function onChange(type: AnonymizeType) {
    api
      .updateAccount({
        accountId: currentCommunity.id,
        anonymize: type,
        anonymizeUsers:
          type === AnonymizeType.MEMBERS || type === AnonymizeType.ALL,
      })
      .then((_) => {
        Toast.success('Saved successfully!');
        setAnonymize(type);
      })
      .catch(() => Toast.error('Something went wrong!'));
  }

  return (
    <>
      <Label htmlFor="anonymize">
        Anonymize your users
        <Label.Description>
          Replace your community member&apos;s display name and profile images
          with randomly generated words.
        </Label.Description>
      </Label>
      <NativeSelect
        id="anonymize"
        defaultValue={anonymize}
        options={[
          {
            label: 'None',
            value: AnonymizeType.NONE,
          },
          {
            label: 'Members',
            value: AnonymizeType.MEMBERS,
          },
          {
            label: 'All',
            value: AnonymizeType.ALL,
          },
        ]}
        theme="blue"
        style={{ width: 'auto' }}
        onChange={(event) => {
          const type = event.target.value as AnonymizeType;
          onChange(type);
        }}
      />
    </>
  );
}
