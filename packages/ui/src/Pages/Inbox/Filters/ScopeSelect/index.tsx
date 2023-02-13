import React from 'react';
import NativeSelect from '../../../../NativeSelect';
import { Scope } from '@linen/types';

interface Props {
  onChange(type: string, value: string): void;
  defaultValue: string;
}

export default function ScopeSelect({ onChange, defaultValue }: Props) {
  return (
    <NativeSelect
      id="scope"
      defaultValue={defaultValue}
      options={[
        { label: 'All', value: Scope.All },
        { label: 'My conversations', value: Scope.Participant },
      ]}
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
        onChange('scope', event.target.value)
      }
    />
  );
}
