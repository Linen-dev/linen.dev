import React from 'react';
import JoinLinen from './JoinLinen';
import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';
import { Permissions } from 'types/shared';

interface Props {
  inviteUrl?: string;
  communityType: String;
  communityId?: string;
  permissions?: Permissions;
}

function JoinButton({
  inviteUrl,
  communityType,
  communityId,
  permissions,
}: Props) {
  if (!inviteUrl) {
    return <JoinLinen accountId={communityId} permissions={permissions} />;
  }
  return communityType === 'discord' ? (
    <JoinDiscord inviteUrl={inviteUrl} />
  ) : (
    <JoinSlack inviteUrl={inviteUrl} />
  );
}

export default JoinButton;
