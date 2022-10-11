import classNames from 'classnames';
import React from 'react';

interface Props {
  className?: string;
  children: React.ReactNode;
}

function Badge({ className, children }: Props) {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800',
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
