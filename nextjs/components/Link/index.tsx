import React from 'react';
import NextLink from 'next/link';

interface Props {
  href: string;
  children: React.ReactNode;
}

export default function Link({ href, children }: Props) {
  return (
    <NextLink
      className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
      href={href}
      passHref
      prefetch={false}
    >
      {children}
    </NextLink>
  );
}
