import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  node?: HTMLElement | null;
  children: React.ReactNode;
}

export default function Portal({ node, children }: Props) {
  const root = document.createElement('div');

  useEffect(() => {
    if (!node) {
      document.body.appendChild(root);

      return () => {
        document.body.removeChild(root);
      };
    }
  }, [node]);

  return ReactDOM.createPortal(children, node || root);
}
