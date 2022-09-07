import React, { useState } from 'react';
import { AccountType } from '@prisma/client';
import Card from '../Card';
import NativeSelect from 'components/NativeSelect';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { isLoginProtectionEnabled } from 'utilities/featureFlags';

interface Props {
  type: AccountType;
  disabled: boolean;
  onChange(type: AccountType): void;
}

function description(type: AccountType) {
  switch (type) {
    case AccountType.PUBLIC:
      return 'Your community is currently public. It can be viewed by anyone. Premium feature.';
    case AccountType.PRIVATE:
      return 'Your community is currently private. It can be viewed by admins. Premium feature.';
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

export default function CommunityTypeCard({
  type: initialType,
  disabled,
  onChange,
}: Props) {
  const [type, setType] = useState(initialType);
  return (
    <Card
      header="Community visibility"
      description={description(type)}
      action={
        isLoginProtectionEnabled && (
          <>
            <NativeSelect
              id="type"
              icon={icon(type)}
              theme="blue"
              options={[
                { label: 'Public', value: AccountType.PUBLIC },
                { label: 'Private', value: AccountType.PRIVATE },
              ]}
              defaultValue={type}
              disabled={disabled}
              onChange={(event: React.SyntheticEvent) => {
                const node = event.target as HTMLSelectElement;
                const type = node.value as AccountType;
                setType(type);
                onChange(type);
              }}
            />
          </>
        )
      }
    />
  );
}
