import React from 'react';
import { SerializedAccount } from 'serializers/account';
import { AccountType } from 'serializers/account';
import Card from '../Card';

interface Props {
  account: SerializedAccount;
}

function description(type: AccountType) {
  switch (type) {
    case AccountType.PUBLIC:
      return 'Your community is currently public. It can be viewed by anyone.';
    case AccountType.PRIVATE:
      return 'Your community is currently private. It can be viewed by admins.';
  }
}

export default function CommunityVisibilityCard({ account }: Props) {
  return (
    <Card
      header="Community visibility"
      description={description(account.type)}
    />
  );
}
