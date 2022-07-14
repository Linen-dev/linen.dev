import React from 'react';

interface Props {
  type: 'danger';
  children: React.ReactNode;
}

export default function Alert({ type, children }: Props) {
  if (type === 'danger') {
    return (
      <div
        className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
        role="alert"
      >
        {children}
      </div>
    );
  }
  return null;
}
