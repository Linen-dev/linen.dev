import React from 'react';
import { SerializedAccount } from 'serializers/account';
import { getHomeUrl, getHomeText } from 'utilities/home';

interface Props {
  account?: SerializedAccount;
}

export default function LinkCard({ account }: Props) {
  const url = getHomeUrl(account);
  const text = getHomeText(url);
  if (!account) {
    return null;
  }
  return (
    <div className="px-4 py-5 sm:p-6 flex flex-row justify-between">
      <div className="grow">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Community URL
        </h3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-gray-500">
            <p>Navigate to your community.</p>
          </div>
        </div>
      </div>
      <div className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        <a href={url} target="_blank" rel="noreferrer">
          {text}
        </a>
      </div>
    </div>
  );
}
