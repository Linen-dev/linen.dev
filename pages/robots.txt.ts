import { createRobotsTxt } from '../utilities/robots';
import prisma from '../client';
import { GetServerSideProps } from 'next/types';

function notFound(res: any) {
  res.statusCode = 404;
  res.end();
  return { props: {} };
}

function domainValid(res: any, domain: string) {
  res.setHeader('Content-Type', 'text/plain');
  res.write(createRobotsTxt(domain));
  res.end();
  return { props: {} };
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { host: domain } = req.headers;
  if (!domain) {
    return notFound(res);
  }

  if (!['linen.dev', 'localhost:3000'].includes(domain)) {
    const account = await prisma.accounts.findFirst({
      where: { redirectDomain: domain },
    });
    console.log('account', account);
    if (account) return domainValid(res, domain);
  }
  // always fallback to ours sitemap.xml
  return domainValid(res, 'linen.dev');
};

export default () => null;
