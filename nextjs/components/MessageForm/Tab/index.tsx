import React from 'react';

interface Props {
  active: boolean;
  onClick(): void;
  children: React.ReactNode;
}

const activeClasses =
  'cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-sm text-xs text-gray-900 bg-gray-100 hover:bg-gray-200';
const inactiveClasses =
  'cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-sm text-xs text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100';

export default function Tab({ active, onClick, children }: Props) {
  return (
    <div className={active ? activeClasses : inactiveClasses} onClick={onClick}>
      {children}
    </div>
  );
}
