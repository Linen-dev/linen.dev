import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  node?: HTMLElement | null;
  id?: string;
  children: React.ReactNode;
}

export default function Portal({ id, children }: Props) {
  if (typeof window === 'undefined') {
    return null;
  }
  const root = document.getElementById(id || 'portal');
  if (!root) {
    return null;
  }

  return ReactDOM.createPortal(children, root);
}
