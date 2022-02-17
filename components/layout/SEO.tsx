import Head from 'next/head';
import { useRouter } from 'next/router';

function SEO({
  description,
  image,
  url,
  noIndex = false,
  title = 'Airbyte Community',
}) {
  const { pathname } = useRouter();
  // If pathname includes a slug, we won't use that.
  const relativePath =
    url || (pathname.includes('[') ? pathname.split('[')[0] : pathname);

  return (
    <Head>
      <title key="title">{title}</title>
      <meta name="description" content={description} key="description" />
      <meta name="robots" content={`${noIndex ? 'no' : ''}index,follow`} />
    </Head>
  );
}

export default SEO;
