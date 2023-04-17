import React from 'react';
import Head from 'next/head';

interface Props {
  url?: string;
}

function getType(url: string): string {
  if (url.endsWith('.png')) {
    return 'image/png';
  } else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  return 'image/x-icon';
}

export default function Favicon({ url }: Props) {
  const faviconUrl = url || 'https://www.linen.dev/favicon.ico';
  return (
    <Head>
      <link
        rel="icon"
        type={getType(faviconUrl.toLocaleLowerCase())}
        href={faviconUrl}
      />
    </Head>
  );
}
