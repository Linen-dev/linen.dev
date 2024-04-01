import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  checked: boolean;
  onChange(checked: boolean): void;
}

export default function Radio({ checked, onChange }: Props) {
  return (
    <input
      className={classNames(styles.radio, styles.switch)}
      type="radio"
      checked={checked}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.checked)
      }
    />
  );
}
