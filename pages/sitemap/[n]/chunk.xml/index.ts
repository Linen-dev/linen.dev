import { GetServerSideProps } from 'next/types';
import { downloadSitemapChunk } from '../../../../services/sitemap';

export const getServerSideProps: GetServerSideProps = async ({
  res,
  query,
}) => {
  console.log('query', query);
  try {
    const { n } = query;
    const sitemap = await downloadSitemapChunk(Number(n));
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
