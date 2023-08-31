import React from 'react';
import JoinLinen from './JoinLinen';
import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';
import { ChatType, SerializedAccount, Settings } from '@linen/types';
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
  return ({ brandColor, fontColor, currentCommunity, settings }: Props) => {
    if (status === 'loading') {
      return <div />;
    }

    if (
      currentCommunity.premium &&
      settings.communityInviteUrl &&
      settings.chat !== ChatType.MEMBERS
    ) {
      return settings.communityType === 'discord' ? (
        <JoinDiscord
          brandColor={brandColor}
          fontColor={fontColor}
          href={settings.communityInviteUrl}
        />
      ) : (
        <JoinSlack
          brandColor={brandColor}
          fontColor={fontColor}
          href={settings.communityInviteUrl}
        />
      );
    } else {
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
    }
  };
}
