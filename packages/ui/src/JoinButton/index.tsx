import React from 'react';
import JoinLinen from './JoinLinen';
import { SerializedAccount, Settings } from '@linen/types';
import type { ApiClient } from '@linen/api-client';

interface WrapperProps {
  status: 'authenticated' | 'loading' | 'unauthenticated';
  startSignUp?: (props: any) => Promise<void>;
  api: ApiClient;
  reload(): void;
}

interface Props {
  brandColor?: string;
  fontColor: string;
  currentCommunity: SerializedAccount;
  settings: Settings;
}

export default function JoinButton({
  status,
  startSignUp,
  api,
  reload,
}: WrapperProps) {
  return ({ brandColor, fontColor, settings }: Props) => {
    return (
      <JoinLinen
        brandColor={brandColor}
        fontColor={fontColor}
        accountId={settings.communityId}
        status={status}
        startSignUp={startSignUp}
        api={api}
        reload={reload}
      />
    );
  };
}
