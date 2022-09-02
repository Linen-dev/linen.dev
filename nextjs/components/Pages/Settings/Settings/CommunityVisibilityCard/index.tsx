import React, { useState } from 'react';
import { SerializedAccount } from 'serializers/account';
import { AccountType } from '@prisma/client';
import Card from '../Card';
import NativeSelect from 'components/NativeSelect';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { isLoginProtectionEnabled } from 'utilities/featureFlags';

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

function icon(type: AccountType) {
  switch (type) {
    case AccountType.PUBLIC:
      return <AiFillEye />;
    case AccountType.PRIVATE:
      return <AiFillEyeInvisible />;
  }
}

export default function CommunityVisibilityCard({ account }: Props) {
  const [type, setType] = useState(account.type);
  return (
    <Card
      header="Community visibility"
      description={description(type)}
      action={
        isLoginProtectionEnabled && (
          <NativeSelect
            id="type"
            icon={icon(type)}
            theme="blue"
            options={[
              { label: 'Public', value: AccountType.PUBLIC },
              { label: 'Private', value: AccountType.PRIVATE },
            ]}
            onChange={(event) => setType(event.target.value as AccountType)}
          />
        )
      }
    />
  );
}
