import React from 'react';

interface Props {
  value: string;
}

const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];

function isImage(href: string): boolean {
  const extension = href.split('.').pop();
  if (!extension) {
    return false;
  }
  return SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
}

export default function Link({ value }: Props) {
  const [href, name] = value.split('|');
  return (
    <a className="underline text-indigo-700" href={href}>
      {name || href}
      {isImage(href) && <img src={href} alt={href} />}
    </a>
  );
}
