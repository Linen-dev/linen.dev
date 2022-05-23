import { isLinenDomain } from '@/utilities/domain';
import { GetServerSideProps } from 'next/types';
import { downloadSitemapChunk } from '../../../../services/sitemap';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  try {
    console.log('query', query);
    const { n } = query;
    const { host } = req.headers;
    const domain = isLinenDomain(host) ? 'linen.dev' : (host as string);
    const sitemap = await downloadSitemapChunk(domain, Number(n));
    res.setHeader('Content-Type', 'application/xml');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error(error);
    res.statusCode = 404;
    res.end();
  }
  return { props: {} };
};

// eslint-disable-next-line import/no-anonymous-default-export
export default () => null;
