import React from 'react';
import JoinLinen from './JoinLinen';
import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';
import { Permissions } from 'types/shared';
import type { Settings } from 'serializers/account/settings';

interface Props {
  settings: Settings;
  permissions?: Permissions;
}

function JoinButton({ settings, permissions }: Props) {
  if (!settings.communityInviteUrl) {
    return (
      <JoinLinen accountId={settings.communityId} permissions={permissions} />
    );
  }
  return settings.communityType === 'discord' ? (
    <JoinDiscord inviteUrl={settings.communityInviteUrl} />
  ) : (
    <JoinSlack inviteUrl={settings.communityInviteUrl} />
  );
}

export default JoinButton;
