import React from 'react';

interface Props {
  value: string;
}

export default function Link({ value }: Props) {
  const [href, name] = value.split('|');
  return (
    <a className="underline text-indigo-700" href={href}>
      {name || href}
    </a>
  );
}
