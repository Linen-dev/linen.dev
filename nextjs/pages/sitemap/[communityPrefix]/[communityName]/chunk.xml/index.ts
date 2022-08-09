import { createXMLSitemapForFreeCommunity } from '@/utilities/sitemap';
import { GetServerSideProps } from 'next/types';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  try {
    const { host } = req.headers;
    if (!host) {
      throw 'host missing';
    }
    const { communityName, communityPrefix } = query;
    const sitemap = await createXMLSitemapForFreeCommunity(
      host,
      communityName as string,
      communityPrefix as string
    );
    res.setHeader('Content-Type', 'application/xml');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.write('Something went wrong');
    res.end();
  }
  return { props: {} };
};

// eslint-disable-next-line import/no-anonymous-default-export
export default () => null;
