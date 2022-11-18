import React from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
  checked?: boolean;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

const Input = styled.input`
  cursor: pointer;
`;

export default function Checkbox({ className, checked, onChange }: Props) {
  return (
    <Input
      checked={checked}
      className={className}
      type="checkbox"
      onChange={onChange}
    />
  );
}
