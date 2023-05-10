import { useState } from 'react';
import Toast from '@linen/ui/Toast';
import Toggle from '@linen/ui/Toggle';
import H3 from '@linen/ui/H3';
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
    <div className="flex">
      <div className="grow">
        <H3>Anonymize your users</H3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-gray-500 dark:text-gray-300">
            Replace your community member&apos;s display name and profile images
            with randomly generated words.
          </div>
        </div>
      </div>
      <div className="self-center">
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
          <Toggle checked={enabled} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
