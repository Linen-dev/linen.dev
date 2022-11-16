import { createSitemapForFreeByChannel } from 'utilities/sitemap';
import { GetServerSideProps } from 'next/types';
import { isSubdomainNotAllowed } from 'utilities/domain';

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

    if (isSubdomainNotAllowed(host)) {
      res.statusCode = 404;
      res.end();
      return { props: {} };
    }

    const { channelName, communityName, communityPrefix } = query;
    const response = await createSitemapForFreeByChannel(
      host,
      channelName as string,
      communityName as string,
      communityPrefix as string
    );
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
