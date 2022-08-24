import React from 'react';
import { SerializedAccount } from 'serializers/account';
import { getHomeUrl, getHomeText } from 'utilities/home';

interface Props {
  account?: SerializedAccount;
}

export default function LinkCard({ account }: Props) {
  const url = getHomeUrl(account);
  const text = getHomeText(url);
  if (account?.syncStatus !== 'DONE') {
    return null;
  }
  return (
    <div className="bg-blue-100">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-blue-900">
          <a href={url} target="_blank" rel="noreferrer">
            {text}
          </a>
        </h3>
      </div>
    </div>
  );
}
