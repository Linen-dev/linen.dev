import { useState } from 'react';
import Toast from '@linen/ui/Toast';
import Toggle from '@linen/ui/Toggle';
import Label from '@linen/ui/Label';
import { SerializedAccount } from '@linen/types';
import { api } from 'utilities/requests';

interface Props {
  currentCommunity: SerializedAccount;
}

export default function AnonymizeCard({ currentCommunity }: Props) {
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
