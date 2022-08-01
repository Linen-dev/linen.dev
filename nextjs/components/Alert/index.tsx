import React from 'react';

interface Props {
  type: 'danger' | 'info';
  children: React.ReactNode;
}

export default function Alert({ type, children }: Props) {
  if (type === 'danger') {
    return (
      <div
        className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
        role="alert"
      >
        {children}
      </div>
    );
  }
  if (type === 'info') {
    return (
      <div
        className="p-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-blue-200 dark:text-blue-800"
        role="alert"
      >
        {children}
      </div>
    );
  }
  return null;
}
