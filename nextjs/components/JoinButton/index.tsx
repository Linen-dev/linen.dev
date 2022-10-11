import React from 'react';
import JoinLinen from './JoinLinen';
import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';

interface Props {
  inviteUrl?: string;
  communityType: String;
  communityId?: string;
}

function JoinButton({ inviteUrl, communityType, communityId }: Props) {
  if (!inviteUrl) {
    return <JoinLinen accountId={communityId} />;
  }
  return communityType === 'discord' ? (
    <JoinDiscord inviteUrl={inviteUrl} />
  ) : (
    <JoinSlack inviteUrl={inviteUrl} />
  );
}

export default JoinButton;
