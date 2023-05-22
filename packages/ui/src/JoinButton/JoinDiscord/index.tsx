import React from 'react';
import Link from '../Link';

interface Props {
  brandColor?: string;
  fontColor: string;
  href: string;
}

export default function JoinDiscord({ brandColor, fontColor, href }: Props) {
  return (
    <Link brandColor={brandColor} fontColor={fontColor} href={href}>
      Join Discord
    </Link>
  );
}
