import React from 'react';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function BlankLayout({ className, children }: Props) {
  return (
    <>
      <div className={className}>{children}</div>
      <div id="portal"></div>
      <div id="modal-portal"></div>
      <div id="tooltip-portal"></div>
    </>
  );
}
