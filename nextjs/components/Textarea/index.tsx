import React from 'react';
import Label from '../Label';
import styles from './index.module.css';

interface Props {
  name: string;
  label?: string;
}

function Textarea({ name, label }: Props) {
  return (
    <>
      <Label htmlFor={name}>{label}</Label>
      <textarea className={styles.textarea} name={name} rows={6}></textarea>
    </>
  );
}

export default Textarea;
