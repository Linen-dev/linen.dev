import React from 'react';
import classNames from 'classnames';

interface Props {
  icon: React.ReactNode;
  href: string;
  text: string;
  active?: boolean;
}

export default function SidebarLink({ icon, href, text, active }: Props) {
  return (
    <a
      href={href}
      className={classNames(
        'border-purple-600 group border-l-4 py-2 px-3 flex items-center text-sm font-medium',
        {
          'bg-purple-50': active,
          'text-purple-600': active,
        }
      )}
      aria-selected={active}
    >
      <div
        className={classNames('mr-3 flex-shrink-0 h-6 w-6', {
          'text-purple-500': active,
        })}
      >
        {icon}
      </div>
      {text}
    </a>
  );
}
