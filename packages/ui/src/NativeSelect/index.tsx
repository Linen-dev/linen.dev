import React from 'react';
import classNames from 'classnames';
import Label from '@/Label';
import styles from './index.module.scss';

interface Option {
  label: string;
  value: string;
}

interface Props {
  className?: string;
  id: string;
  name?: string;
  label?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: object;
  onChange?(event: React.ChangeEvent<HTMLSelectElement>): void;
  onKeyDown?(event: React.KeyboardEvent<HTMLSelectElement>): void;
  options: Option[];
  theme?: 'white' | 'blue' | 'gray';
}

function NativeSelect({
  className,
  id,
  name,
  required,
  label,
  defaultValue,
  value,
  disabled = false,
  icon,
  onChange,
  onKeyDown,
  options,
  theme,
  style,
}: Props) {
  return (
    <>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div
        className={classNames(className, styles.container, {
          [styles.blue]: theme === 'blue',
          [styles.gray]: theme === 'gray',
          [styles.disabled]: disabled,
        })}
      >
        {icon && <div className={styles.icon}>{icon}</div>}
        <select
          className={styles.select}
          id={id}
          style={style}
          name={id || name}
          required={required}
          defaultValue={defaultValue}
          value={value}
          disabled={disabled}
          onChange={onChange}
          onKeyDown={onKeyDown}
        >
          {options.map((option: Option, index: number) => (
            <option key={`${option.value}-${index}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export default NativeSelect;
