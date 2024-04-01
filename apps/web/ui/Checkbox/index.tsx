import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  checked?: boolean;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default function Checkbox({ className, checked, onChange }: Props) {
  return (
    <input
      className={classNames(styles.input, className)}
      checked={checked}
      type="checkbox"
      onChange={onChange}
    />
  );
}
