import Head from 'next/head';
import { useRouter } from 'next/router';

const getFullPath = (relativePath) => `https://linen.dev${relativePath}`;

interface Props {
  description: string;
  url: string;
  noIndex: boolean;
  title: string;
}

function SEO({
  description = 'Community Conversations',
  url,
  noIndex = false,
  title = 'Linen Community',
}: Props) {
  const { pathname } = useRouter();
  // If pathname includes a slug, we won't use that.
  const relativePath =
    url || (pathname.includes('[') ? pathname.split('[')[0] : pathname);

  return (
    <Head>
      <title key="title">{title}</title>
      <meta name="description" content={description} key="description" />
      <meta name="robots" content={`${noIndex ? 'no' : ''}index,follow`} />

      {/* Open Graph */}
      <meta
        name="og:url"
        property="og:url"
        content={getFullPath(relativePath)}
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
        content={description}
        key="ogdesc"
      />
      <meta name="og:type" property="og:type" content="website" key="ogtype" />
    </Head>
  );
}

export default SEO;
