import { createXMLSitemapForChannel } from 'utilities/sitemap';
import { GetServerSideProps } from 'next/types';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { captureExceptionAndFlush } from 'utilities/sentry';
import { appendProtocol } from 'utilities/url';

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
      hostname: `${appendProtocol(host)}/${communityPrefix}/${communityName}/`,
    });
    const response = await streamToPromise(
      Readable.from(sitemap).pipe(stream)
    ).then((data) => data.toString());

    res.setHeader('Content-Type', 'application/xml');
    res.write(response);
    res.end();
  } catch (error) {
    await captureExceptionAndFlush(error);
    console.error(error);
    res.statusCode = 500;
    res.write('Something went wrong');
    res.end();
  }
  return { props: {} };
};

// eslint-disable-next-line import/no-anonymous-default-export
export default () => null;
