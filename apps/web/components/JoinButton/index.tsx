import React from 'react';
import JoinLinen from './JoinLinen';
import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';
import { ChatType, SerializedAccount, Settings } from '@linen/types';
import { useSession } from '@linen/auth/client';

interface Props {
  fontColor: string;
  currentCommunity: SerializedAccount;
  settings: Settings;
}

function JoinButton({ fontColor, currentCommunity, settings }: Props) {
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
      <JoinDiscord fontColor={fontColor} href={settings.communityInviteUrl} />
    ) : (
      <JoinSlack fontColor={fontColor} href={settings.communityInviteUrl} />
    );
  } else {
    return (
      <JoinLinen
        fontColor={fontColor}
        accountId={settings.communityId}
        {...{ status }}
      />
    );
  }
}

export default JoinButton;
