import React from 'react';
import Label from '@/Label';
import styles from './index.module.scss';

interface Props {
  name: string;
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  label?: string;
  hidden?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  maxLength?: number;
}

function Textarea({
  name,
  id,
  placeholder,
  defaultValue,
  label,
  hidden,
  rows = 6,
  maxLength,
  onChange,
}: Props) {
  return (
    <>
      {label && <Label htmlFor={name}>{label}</Label>}
      <textarea
        className={styles.textarea}
        id={id || name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        name={name}
        hidden={hidden}
        rows={rows}
        onChange={onChange}
        maxLength={maxLength}
      ></textarea>
    </>
  );
}

export default Textarea;
