import React from 'react';
import JoinLinen from './JoinLinen';
import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';
import { ChatType, SerializedAccount, Settings } from '@linen/types';
import { useSession } from '@linen/auth/client';

interface Props {
  brandColor?: string;
  fontColor: string;
  currentCommunity: SerializedAccount;
  settings: Settings;
}

function JoinButton({
  brandColor,
  fontColor,
  currentCommunity,
  settings,
}: Props) {
  const { status } = useSession();

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
        {...{ status }}
      />
    );
  }
}

export default JoinButton;
