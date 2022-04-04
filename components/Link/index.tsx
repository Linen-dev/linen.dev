import React from 'react';
import NextLink from 'next/link';

interface Props {
  href: string;
  children: React.ReactNode;
}

export default function Link({ href, children }: Props) {
  return (
    <NextLink href={href} passHref>
      <a className="text-blue-600 hover:text-blue-800 visited:text-purple-600">
        {children}
      </a>
    </NextLink>
  );
}
