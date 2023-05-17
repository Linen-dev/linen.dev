import React from 'react';
import Example from '../Example';
import NativeSelect from '@/NativeSelect';
import { AiOutlineNumber } from '@react-icons/all-files/ai/AiOutlineNumber';

export default function NativeSelectExample() {
  return (
    <Example header="NativeSelect">
      <Example description="NativeSelect can have a label.">
        <NativeSelect
          label="Name"
          id="select-input-a"
          options={[
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
          ]}
        />
        <NativeSelect
          label="Name"
          id="select-input-b"
          theme="blue"
          options={[
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
          ]}
        />
        <NativeSelect
          label="Name"
          id="select-input-c"
          theme="gray"
          options={[
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
          ]}
        />
      </Example>
      <Example description="NativeSelect can have an icon.">
        <NativeSelect
          id="select-input-e"
          icon={<AiOutlineNumber />}
          options={[
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
          ]}
        />
        <NativeSelect
          id="select-input-f"
          icon={<AiOutlineNumber />}
          theme="blue"
          options={[
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
          ]}
        />
      </Example>
      <Example description="NativeSelect can be disabled.">
        <NativeSelect
          id="select-input-g"
          icon={<AiOutlineNumber />}
          disabled
          options={[
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
          ]}
        />
        <NativeSelect
          id="select-input-h"
          icon={<AiOutlineNumber />}
          theme="blue"
          disabled
          options={[
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
          ]}
        />
      </Example>
    </Example>
  );
}
