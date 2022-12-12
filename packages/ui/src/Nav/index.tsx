import React from 'react';
import Item from './Item';
import Label from './Label';

interface Props {
  className?: string;
  children: React.ReactNode;
}

function Nav({ className, children }: Props) {
  return <div className={className}>{children}</div>;
}

Nav.Item = Item;
Nav.Label = Label;

export default Nav;
