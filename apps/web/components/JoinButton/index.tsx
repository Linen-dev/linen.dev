import React from 'react';
import JoinLinen from './JoinLinen';
import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';
import { ChatType, Settings } from '@linen/types';

interface Props {
  settings: Settings;
}

function JoinButton({ settings }: Props) {
  if (!settings.communityInviteUrl || settings.chat === ChatType.MEMBERS) {
    return <JoinLinen accountId={settings.communityId} />;
  }
  return settings.communityType === 'discord' ? (
    <JoinDiscord inviteUrl={settings.communityInviteUrl} />
  ) : (
    <JoinSlack inviteUrl={settings.communityInviteUrl} />
  );
}

export default JoinButton;
