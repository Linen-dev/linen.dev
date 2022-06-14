import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const getFullPath = (relativePath: string) =>
  `https://linen.dev${relativePath}`;
const siteName = 'Linen Community';

function SEO({
  description,
  image,
  url,
  noIndex = false,
  title = 'Linen Community',
}: {
  description: string;
  image: string;
  url: string;
  noIndex: boolean;
  title: string;
}) {
  const { pathname, asPath } = useRouter();
  const [metaUrl, setMetaUrl] = useState<string | undefined>();

  useEffect(() => {
    setMetaUrl(window?.location?.href);
  }, []);

  useEffect(() => {
    setMetaUrl(window?.location?.href);
  }, [asPath]);

  // If pathname includes a slug, we won't use that.
  const relativePath =
    url || (pathname.includes('[') ? pathname.split('[')[0] : pathname);

  return (
    <Head>
      <title key="title">{title}</title>
      <meta
        name="description"
        content={description || title}
        key="description"
      />
      <meta name="robots" content={`${noIndex ? 'no' : ''}index,follow`} />

      {/* Open Graph */}
      <meta
        name="og:url"
        property="og:url"
        content={metaUrl || getFullPath(relativePath)}
        key="ogurl"
      />
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
      <link rel="canonical" href={metaUrl} />
    </Head>
  );
}

export default SEO;
