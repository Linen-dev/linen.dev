import React from 'react';
import Item from './Item';

interface Props {
  className?: string;
  children: React.ReactNode;
}

function Nav({ className, children }: Props) {
  return <div className={className}>{children}</div>;
}

Nav.Item = Item;

export default Nav;
