import { getDomain, getSubdomain } from '../utilities/domain';
import {
  createRobotsTxt,
  createRobotsTxtForSubdomain,
} from '../utilities/robots';
import prisma from '../client';

export const getServerSideProps = async ({ req, res }) => {
  const { host } = req.headers;
  const domain = getDomain(host);
  const subdomain = getSubdomain(host);

  if (subdomain) {
    const account = await prisma.accounts.findFirst({
      where: { name: subdomain },
    });
    if (account) {
      const robots = createRobotsTxtForSubdomain(domain, subdomain);
      res.setHeader('Content-Type', 'text/plain');
      res.write(robots);
      res.end();
    } else {
      res.statusCode = 404;
      res.end();
    }
  } else {
    const robots = createRobotsTxt(domain);
    res.setHeader('Content-Type', 'text/plain');
    res.write(robots);
    res.end();
  }

  return {
    props: {},
  };
};

export default () => null;
