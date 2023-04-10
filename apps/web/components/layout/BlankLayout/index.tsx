import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function BlankLayout({ children }: Props) {
  return (
    <>
      <div>{children}</div>
      <div id="modal-wrapper"></div>
    </>
  );
}
