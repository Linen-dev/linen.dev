import React from 'react';
import Example from '../Example';
import TextInput from '@/TextInput';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';

export default function TextInputExample() {
  return (
    <Example header="TextInput">
      <Example description="TextInput can have a label.">
        <TextInput label="Name" id="text-input-foo" />
      </Example>
      <Example description="TextInput can have an icon and a placeholder text.">
        <TextInput
          id="text-input-bar"
          icon={<FiSearch />}
          placeholder="Search"
        />
      </Example>
    </Example>
  );
}
