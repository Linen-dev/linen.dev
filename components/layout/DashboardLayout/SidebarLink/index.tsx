import React from 'react';

interface Props {
  icon: React.ReactNode;
  href: string;
  text: string;
}

export default function SidebarLink({ icon, href, text }: Props) {
  return (
    <a
      href={href}
      className="bg-purple-50 border-purple-600 text-purple-600 group border-l-4 py-2 px-3 flex items-center text-sm font-medium"
    >
      <div className="text-purple-500 mr-3 flex-shrink-0 h-6 w-6">{icon}</div>
      {text}
    </a>
  );
}
