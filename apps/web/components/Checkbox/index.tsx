import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props {
  className?: string;
  checked?: boolean;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default function Checkbox({ className, checked, onChange }: Props) {
  return (
    <input
      checked={checked}
      className={classNames(styles.checkbox, className)}
      type="checkbox"
      onChange={onChange}
    />
  );
}
