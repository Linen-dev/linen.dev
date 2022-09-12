import React from 'react';
import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';

interface Option {
  label: string;
  value: any;
}

interface Props {
  options: Option[];
  value: any;
  onChange(value: any): void;
}

export default function ButtonToggle({ value, options, onChange }: Props) {
  return (
    <ButtonGroup>
      {options.map((option, index) => {
        return (
          <Button
            key={`${option.label}-${index}`}
            color={option.value === value ? 'white' : 'transparent'}
            size="xs"
            rounded="full"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
