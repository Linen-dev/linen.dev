import React from 'react';
import JoinLinen from './JoinLinen';
import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';

interface Props {
  inviteUrl?: string;
  communityType: String;
}

function JoinButton({ inviteUrl, communityType }: Props) {
  if (!inviteUrl) {
    return <JoinLinen />;
  }
  return communityType === 'discord' ? (
    <JoinDiscord inviteUrl={inviteUrl} />
  ) : (
    <JoinSlack inviteUrl={inviteUrl} />
  );
}

export default JoinButton;
