import { createXMLSitemapForChannel } from 'utilities/sitemap';
import { GetServerSideProps } from 'next/types';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

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
    const { channelName, communityName, communityPrefix } = query;

    const sitemap = await createXMLSitemapForChannel(
      communityName as string,
      channelName as string
    );
    const stream = new SitemapStream({
      hostname: `https://${host}/${communityPrefix}/${communityName}/`,
    });
    const response = await streamToPromise(
      Readable.from(sitemap).pipe(stream)
    ).then((data) => data.toString());

    res.setHeader('Content-Type', 'application/xml');
    res.write(response);
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
