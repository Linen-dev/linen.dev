import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props {
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  block?: boolean;
  children?: ReactNode;
  onClick?(event: React.SyntheticEvent): void;
  disabled?: boolean;
  color?: 'blue' | 'white' | 'gray' | 'transparent' | 'yellow' | 'disabled';
  rounded?: 'lg' | 'full';
  size?: 'sm' | 'xs';
  weight?: 'medium' | 'normal';
}

const presetColors: Record<string, string> = {
  blue: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
  white: 'text-black bg-white',
  gray: 'text-black bg-gray-100 hover:bg-gray-200',
  transparent: 'text-black bg-transparent',
  yellow: 'text-white bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-600',
  disabled: 'text-black bg-gray-200',
};

const Button = ({
  className,
  type,
  block,
  children,
  onClick,
  disabled = false,
  color = 'blue',
  rounded = 'lg',
  size = 'sm',
  weight = 'medium',
}: Props) => {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={classNames(
        styles.button,
        className,
        'mb-2',
        {
          'w-full': block,
          'font-medium': weight === 'medium',
          'rounded-lg': rounded === 'lg',
          'rounded-full': rounded === 'full',
          'text-sm px-4 py-2': size === 'sm',
          'text-xs px-4 py-2': size === 'xs',
        },
        disabled ? presetColors['disabled'] : presetColors[color]
      )}
    >
      {children}
    </button>
  );
};

Button.defaultProps = {
  type: 'button',
};

export default Button;
