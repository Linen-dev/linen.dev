import React from 'react';
import Item from './Item';
import Label from './Label';
import Group from './Group';

interface Props {
  className?: string;
  children: React.ReactNode;
}

function Nav({ className, children }: Props) {
  return <div className={className}>{children}</div>;
}

Nav.Item = Item;
Nav.Label = Label;
Nav.Group = Group;

export default Nav;
