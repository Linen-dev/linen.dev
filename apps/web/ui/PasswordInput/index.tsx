import React from 'react';
import TextInput from '@/TextInput';

interface Props {
  id: string;
  className?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
}

function PasswordInput({ id, className, name, placeholder, required }: Props) {
  return (
    <TextInput
      type="password"
      className={className}
      id={id}
      name={name}
      placeholder={placeholder}
      required={required}
    />
  );
}

export default PasswordInput;
