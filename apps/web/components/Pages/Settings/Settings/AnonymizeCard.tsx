import React, { useState } from 'react';
import { SettingsProps, WaitForIntegration } from '..';
import { Toast } from '@linen/ui';
import Toggle from 'components/Toggle';

function AnonymizeCardComponent({
  enabled,
  onChange,
  hasAuth,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  hasAuth?: boolean;
}) {
  return (
    <div className="bg-white">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex">
          <div className="grow">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Anonymize your users
            </h3>
            <div className="mt-2 sm:flex sm:items-start sm:justify-between">
              <div className="max-w-xl text-sm text-gray-500">
                Replace your community member&apos;s display name and profile
                images with randomly generated words.
              </div>
            </div>
          </div>
          <div className="self-center">
            <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
              {hasAuth ? (
                <Toggle checked={enabled} onChange={onChange} />
              ) : (
                <WaitForIntegration />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnonymizeCard({ account }: SettingsProps) {
  const [enabled, setEnabled] = useState(account?.anonymizeUsers || false);

  async function onChange(toggle: boolean) {
    if (!account) {
      return Toast.error('Missing community integration');
    }
    fetch('/api/accounts', {
      method: 'PUT',
      body: JSON.stringify({
        communityId: account?.id,
        anonymizeUsers: toggle,
      }),
    })
      .then((response) => {
        if (response.ok) {
          Toast.success('Saved successfully!');
          setEnabled(toggle);
        } else {
          throw 'fail to update';
        }
      })
      .catch(() => Toast.error('Something went wrong!'));
  }

  return (
    <AnonymizeCardComponent
      enabled={enabled}
      onChange={onChange}
      hasAuth={!!account}
    />
  );
}
