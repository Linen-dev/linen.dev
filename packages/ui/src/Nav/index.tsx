import React from 'react';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function Nav({ className, children }: Props) {
  return <div className={className}>{children}</div>;
}
