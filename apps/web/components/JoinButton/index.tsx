import React from 'react';
import JoinLinen from './JoinLinen';
import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';
import Link from './Link';
import { ChatType, SerializedAccount, Settings } from '@linen/types';

interface Props {
  fontColor: string;
  currentCommunity: SerializedAccount;
  settings: Settings;
}

function JoinButton({ fontColor, currentCommunity, settings }: Props) {
  if (currentCommunity.premium) {
    if (!settings.communityInviteUrl || settings.chat === ChatType.MEMBERS) {
      return (
        <JoinLinen fontColor={fontColor} accountId={settings.communityId} />
      );
    }
    return settings.communityType === 'discord' ? (
      <JoinDiscord fontColor={fontColor} href={settings.communityInviteUrl} />
    ) : (
      <JoinSlack fontColor={fontColor} href={settings.communityInviteUrl} />
    );
  } else {
    return (
      <>
        <Link fontColor={fontColor} href="https://linen.dev/signin">
          Sign In
        </Link>
        <Link fontColor={fontColor} href="https://linen.dev/signup">
          Sign Up
        </Link>
      </>
    );
  }
}

export default JoinButton;
