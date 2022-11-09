import React from 'react';
import JoinLinen from './JoinLinen';
import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';
import type { Settings } from 'serializers/account/settings';

interface Props {
  settings: Settings;
}

function JoinButton({ settings }: Props) {
  if (!settings.communityInviteUrl) {
    return <JoinLinen accountId={settings.communityId} />;
  }
  return settings.communityType === 'discord' ? (
    <JoinDiscord inviteUrl={settings.communityInviteUrl} />
  ) : (
    <JoinSlack inviteUrl={settings.communityInviteUrl} />
  );
}

export default JoinButton;
