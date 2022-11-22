import React from 'react';
import { SerializedAccount } from '@linen/types';
import { getHomeUrl } from 'utilities/home';

interface Props {
  account?: SerializedAccount;
}

export default function Logo({ account }: Props) {
  const url = getHomeUrl(account);
  return (
    <div className="flex-shrink-0 px-4 flex items-center">
      <a href={url} target="_blank" rel="noreferrer">
        <img
          className="h-6 w-auto"
          src="https://linen-assets.s3.amazonaws.com/linen-black-logo.svg"
          alt="Linen logo"
        />
      </a>
    </div>
  );
}
