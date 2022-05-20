import { createXMLSitemapForSubdomain } from '../utilities/sitemap';
import { getSubdomain } from '../utilities/domain';
import { GetServerSideProps } from 'next/types';
import { downloadSitemapMain } from 'services/sitemap';

const linenHostname = ['localhost:3000', 'linen.dev', 'ngrok.io'];

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const { host } = req.headers;

    if (!host) {
      throw 'no host in headers';
    }

    if (
      linenHostname.find(
        (linenHost) => linenHost === host || host.endsWith(linenHost)
      )
    ) {
      const sitemap = await downloadSitemapMain();
      res.write(sitemap);
      res.end();
      return { props: {} };
    }

    const subdomain = getSubdomain(host);
    if (!subdomain) {
      throw 'is not a subdomain';
    }

    const sitemap = await createXMLSitemapForSubdomain(host, subdomain);
    res.setHeader('Content-Type', 'application/xml');
    res.write(sitemap);
    res.end();
  } catch (exception) {
    console.error(exception);
    res.statusCode = 404;
    res.end();
  }

  return {
    props: {},
  };
};

// eslint-disable-next-line import/no-anonymous-default-export
export default () => null;
