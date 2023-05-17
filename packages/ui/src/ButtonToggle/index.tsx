import React from 'react';
import Button from '@/Button';
import ButtonGroup from '@/ButtonGroup';
import styles from './index.module.scss';

interface Option {
  label: string;
  icon?: React.ReactNode;
  value: any;
}

interface Props {
  className?: string;
  options: Option[];
  value: any;
  onChange(value: any): void;
}

export default function ButtonToggle({
  className,
  value,
  options,
  onChange,
}: Props) {
  return (
    <ButtonGroup className={className}>
      {options.map((option, index) => {
        return (
          <Button
            key={`${option.label}-${index}`}
            className={styles.button}
            color={option.value === value ? 'white' : 'transparent'}
            size="xs"
            onClick={() => onChange(option.value)}
          >
            {option.icon}
            {option.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
