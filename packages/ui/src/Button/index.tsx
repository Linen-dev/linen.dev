import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

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
      className={classNames(styles.button, className, {
        [styles.block]: block,
        [styles.medium]: weight === 'medium',
        [styles['rounded-lg']]: rounded === 'lg',
        [styles['rounded-full']]: rounded === 'full',
        [styles.sm]: size === 'sm',
        [styles.xs]: size === 'xs',
        [styles.disabled]: disabled,
        [styles.white]: color === 'white',
        [styles.gray]: color === 'gray',
        [styles.blue]: color === 'blue',
        [styles.yellow]: color === 'yellow',
        [styles.transparent]: color === 'transparent',
      })}
    >
      {children}
    </button>
  );
};

Button.defaultProps = {
  type: 'button',
};

export default Button;
