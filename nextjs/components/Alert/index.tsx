import React from 'react';

interface Props {
  type: 'danger' | 'info';
  children: React.ReactNode;
}

const colors = {
  danger: 'red',
  info: 'blue',
};

export default function Alert({ type, children }: Props) {
  const color = colors[type];
  return (
    <div
      className={`p-4 text-sm text-${color}-700 bg-${color}-100 rounded-lg dark:bg-${color}-200 dark:text-${color}-800`}
      role="alert"
    >
      {children}
    </div>
  );
}
