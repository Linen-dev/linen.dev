import {
  createXMLSitemapForLinen,
  createXMLSitemapForSubdomain,
} from '../utilities/sitemap';
import { isLinenDomain } from '../utilities/domain';
import { GetServerSideProps } from 'next/types';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { host } = req.headers;
  try {
    if (!host) {
      throw 'host missing';
    }

    const sitemap = isLinenDomain(host)
      ? await createXMLSitemapForLinen(host)
      : await createXMLSitemapForSubdomain(host);
    res.setHeader('Content-Type', 'application/xml');
    res.write(sitemap);
    res.end();
  } catch (exception) {
    console.error(exception);
    res.statusCode = 500;
    res.write('Something went wrong');
    res.end();
  }
  return {
    props: {},
  };
};

// eslint-disable-next-line import/no-anonymous-default-export
export default () => null;
