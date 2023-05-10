import React from 'react';
import classNames from 'classnames';
import NextLink from 'next/link';

interface Props {
  className?: string;
  href: string;
  children: React.ReactNode;
}

export default function Link({ className, href, children }: Props) {
  return (
    <NextLink
      className={classNames(
        'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600',
        className
      )}
      href={href}
      passHref
      prefetch={false}
    >
      {children}
    </NextLink>
  );
}
