import { createSitemapForSubdomainChannel } from 'utilities/sitemap';
import { GetServerSideProps } from 'next/types';
import { captureExceptionAndFlush } from 'utilities/sentry';

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
    const { channelName } = query;
    const response = await createSitemapForSubdomainChannel(
      host,
      channelName as string
    );
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
