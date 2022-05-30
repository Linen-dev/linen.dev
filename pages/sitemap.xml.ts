import {
  createXMLSitemapForLinen,
  createXMLSitemapForSubdomain,
} from '../utilities/sitemap';
import { getSubdomain, isLinenDomain } from '../utilities/domain';
import { GetServerSideProps } from 'next/types';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { host } = req.headers;
  try {
    if (!host) {
      throw 'host missing';
    } else if (isLinenDomain(host)) {
      const subdomain = getSubdomain(host);
      if (subdomain) {
        return {
          redirect: {
            permanent: false,
            destination: 'https://linen.dev/sitemap.xml',
          },
          props: {},
        };
      } else {
        const sitemap = await createXMLSitemapForLinen('linen.dev');
        res.setHeader('Content-Type', 'application/xml');
        res.write(sitemap);
        res.end();
      }
    } else {
      const sitemap = await createXMLSitemapForSubdomain(host);
      res.setHeader('Content-Type', 'application/xml');
      res.write(sitemap);
      res.end();
    }
    return { props: {} };
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
