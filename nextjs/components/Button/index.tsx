import { ReactNode } from 'react';
import classNames from 'classnames';

interface Props {
  type?: 'button' | 'submit' | 'reset';
  block?: boolean;
  children?: ReactNode;
  onClick?(): void;
  disabled?: boolean;
  color?: 'blue' | 'white' | 'transparent' | 'yellow' | 'disabled';
  rounded?: 'lg' | 'full';
  size?: 'sm' | 'xs';
}

const presetColors: Record<string, string> = {
  blue: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
  white: 'text-black bg-white',
  transparent: 'text-black bg-transparent',
  yellow: 'text-white bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-600',
  disabled: 'text-black bg-gray-200',
};

const Button = ({
  type,
  block,
  children,
  onClick,
  disabled = false,
  color = 'blue',
  rounded = 'lg',
  size = 'sm',
}: Props) => {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={classNames(
        'font-medium mb-2',
        {
          'w-full': block,
          'rounded-lg': rounded === 'lg',
          'rounded-full': rounded === 'full',
          'text-sm px-5 py-2.5': size === 'sm',
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
