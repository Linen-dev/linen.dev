import React from 'react';
import Label from '../Label';
import styles from './index.module.css';

interface Props {
  name: string;
  id?: string;
  defaultValue?: string;
  label?: string;
  hidden?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function Textarea({ name, id, defaultValue, label, hidden, onChange }: Props) {
  return (
    <>
      {label && <Label htmlFor={name}>{label}</Label>}
      <textarea
        className={styles.textarea}
        id={id || name}
        defaultValue={defaultValue}
        name={name}
        hidden={hidden}
        rows={6}
        onChange={onChange}
      ></textarea>
    </>
  );
}

export default Textarea;
