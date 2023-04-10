import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  node?: HTMLElement | null;
  children: React.ReactNode;
}

export default function Portal({ node, children }: Props) {
  if (typeof window === 'undefined') {
    return null;
  }
  const root = document.getElementById('portal');
  if (!root) {
    return null;
  }

  return ReactDOM.createPortal(children, root);
}
