import Head from 'next/head';

export interface SeoProps {
  description: string;
  image?: string;
  url: string;
  title: string;
  robotsMetaTag?: string | null;
}

export default function SEO({
  description,
  image = 'https://static.main.linendev.com/logos/linen-black-logo.svg',
  url,
  title = 'Linen Community',
  robotsMetaTag,
}: SeoProps) {
  return (
    <Head>
      <title key="title">{title}</title>
      <meta
        name="description"
        content={description || title}
        key="description"
      />
      <meta name="robots" content={robotsMetaTag || 'all'} />

      {/* Open Graph */}
      <meta name="og:url" property="og:url" content={url} key="ogurl" />
      <meta name="og:image" property="og:image" content={image} key="ogimage" />
      <meta
        name="og:site_name"
        property="og:site_name"
        content={title}
        key="ogsitename"
      />
      <meta name="og:title" property="og:title" content={title} key="ogtitle" />
      <meta
        name="og:description"
        property="og:description"
        content={description || title}
        key="ogdesc"
      />
      <meta name="og:type" property="og:type" content="website" key="ogtype" />
      <link rel="canonical" href={url} />
    </Head>
  );
}
