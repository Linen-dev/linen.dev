import React from 'react';
import { SerializedAccount } from 'serializers/account';
import { getLogoLinkUrl, getLogoLinkText } from './utilities';

interface Props {
  account?: SerializedAccount;
}

export default function Logo({ account }: Props) {
  const url = getLogoLinkUrl(account);
  const text = getLogoLinkText(url);
  return (
    <div className="flex-shrink-0 px-4 flex items-center">
      <a href={url} target="_blank">
        <img
          className="h-6 w-auto"
          src="https://linen-assets.s3.amazonaws.com/linen-black-logo.svg"
          alt="Linen logo"
        />
        {text && <small className="text-blue-700">{text}</small>}
      </a>
    </div>
  );
}
