import React, { useState } from 'react';
import Toast from '@/Toast';
import Toggle from '@/Toggle';
import Label from '@/Label';
import { SerializedAccount } from '@linen/types';
import type { ApiClient } from '@linen/api-client';

interface Props {
  currentCommunity: SerializedAccount;
  api: ApiClient;
}

export default function AnonymizeCard({ currentCommunity, api }: Props) {
  const [enabled, setEnabled] = useState(
    currentCommunity.anonymizeUsers || false
  );

  async function onChange(toggle: boolean) {
    api
      .updateAccount({
        accountId: currentCommunity.id,
        anonymizeUsers: toggle,
      })
      .then((_) => {
        Toast.success('Saved successfully!');
        setEnabled(toggle);
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
      <Toggle checked={enabled} onChange={onChange} />
    </>
  );
}
