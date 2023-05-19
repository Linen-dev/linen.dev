import React, { useState } from 'react';
import { AccountType } from '@linen/types';
import Label from '@/Label';
import NativeSelect from '@/NativeSelect';
import { AiFillEye } from '@react-icons/all-files/ai/AiFillEye';
import { AiFillEyeInvisible } from '@react-icons/all-files/ai/AiFillEyeInvisible';

interface Props {
  type: AccountType;
  disabled: boolean;
  onChange(type: AccountType): void;
}

function description(type: AccountType) {
  switch (type) {
    case AccountType.PUBLIC:
      return 'Your community is currently public. It can be viewed by anyone.';
    case AccountType.PRIVATE:
      return 'Your community is currently private. It can be viewed by members.';
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

export default function CommunityTypeRow({
  type: initialType,
  disabled,
  onChange,
}: Props) {
  const [type, setType] = useState(initialType);
  return (
    <>
      {disabled ? (
        <small>Premium feature</small>
      ) : (
        <>
          <Label htmlFor="community-type-row">
            Community visibility
            <Label.Description>{description(type)}</Label.Description>
          </Label>
          <NativeSelect
            style={{ width: 'auto' }}
            id="type"
            icon={icon(type)}
            theme="blue"
            options={[
              { label: 'Public', value: AccountType.PUBLIC },
              { label: 'Private', value: AccountType.PRIVATE },
            ]}
            defaultValue={type}
            onChange={(event: React.SyntheticEvent) => {
              const node = event.target as HTMLSelectElement;
              const type = node.value as AccountType;
              setType(type);
              onChange(type);
            }}
          />
        </>
      )}
    </>
  );
}
