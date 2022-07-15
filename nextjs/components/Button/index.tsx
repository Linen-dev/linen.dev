import { ReactNode } from 'react';
import classNames from 'classnames';

interface Props {
  type?: 'button' | 'submit' | 'reset';
  block?: boolean;
  children?: ReactNode;
  onClick?(): void;
  disabled?: boolean;
  color?: 'blue' | 'yellow' | 'disabled';
}

const presetColors: Record<string, string> = {
  blue: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
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
}: Props) => {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={classNames(
        'font-medium rounded-lg text-sm px-5 py-2.5 mb-2 focus:ring-4 focus:outline-none',
        { 'w-full': block },
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
