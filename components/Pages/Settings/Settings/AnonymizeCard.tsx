import React, { useState } from 'react';
import { Switch } from '@headlessui/react';
import classNames from 'classnames';
import { SettingsProps, WaitForIntegration } from '..';
import { toast } from '@/components/Toast';

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
    <div className="bg-white shadow sm:rounded-lg">
      <Switch.Group as="div" className="px-4 py-5 sm:p-6">
        <div className="flex">
          <div className="grow">
            <Switch.Label
              as="h3"
              className="text-lg leading-6 font-medium text-gray-900"
              passive
            >
              Anonymize your users
            </Switch.Label>
            <div className="mt-2 sm:flex sm:items-start sm:justify-between">
              <div className="max-w-xl text-sm text-gray-500">
                <Switch.Description>
                  Replace your community member&apos;s display name and profile
                  images with randomly generated words.
                </Switch.Description>
              </div>
            </div>
          </div>
          <div className="self-center">
            <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
              {hasAuth ? (
                <Switch
                  checked={enabled}
                  onChange={onChange}
                  className={classNames(
                    enabled ? 'bg-blue-700' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      enabled ? 'translate-x-5' : 'translate-x-0',
                      'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              ) : (
                <WaitForIntegration />
              )}
            </div>
          </div>
        </div>
      </Switch.Group>
    </div>
  );
}

export default function AnonymizeCard({ account }: SettingsProps) {
  const [enabled, setEnabled] = useState(account?.anonymizeUsers || false);

  async function onChange(toggle: boolean) {
    if (!account) {
      return toast.error('Missing community integration');
    }
    fetch('/api/accounts', {
      method: 'PUT',
      body: JSON.stringify({
        accountId: account.id,
        anonymizeUsers: toggle,
      }),
    })
      .then((response) => {
        if (response.ok) {
          toast.success('Saved successfully!');
          setEnabled(toggle);
        } else {
          throw 'fail to update';
        }
      })
      .catch(() => toast.error('Something went wrong!'));
  }

  return (
    <AnonymizeCardComponent
      enabled={enabled}
      onChange={onChange}
      hasAuth={account?.hasAuth}
    />
  );
}
