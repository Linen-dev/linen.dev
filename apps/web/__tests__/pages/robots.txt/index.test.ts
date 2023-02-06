import { getServerSideProps } from '../../../pages/robots.txt';
import { Writable } from 'stream';

const mockAccount = {
  redirectDomain: 'osquery.fleetdm.com',
};

jest.mock('@linen/database', () => ({
  accounts: {
    findFirst: jest.fn(() => Promise.resolve(mockAccount)),
  },
}));

interface CustomWritable extends Writable {
  body: string;
  setHeader: (k: string, v: string) => void;
  headers: Record<string, string>;
  statusCode?: number;
}

function createResponseStream(): CustomWritable {
  const res: CustomWritable = new Writable();
  res.body = '';
  res.setHeader = function (a: string, b: string) {
    this.headers = { [a]: b };
  };
  res._write = function (chunk, encoding, done) {
    res.body += chunk.toString();
    done();
  };
  return res;
}

describe('robots.txt', () => {
  it.skip('robots.txt should return correct sitemap.xml path for subdomain osquery.fleetdm.com', async () => {
    const domain = mockAccount.redirectDomain;
    const host = `https://${domain}`;
    const res = createResponseStream();
    const context = {
      req: {
        headers: { host },
      },
      res,
    };
    await getServerSideProps(context);
    expect(res.headers['Content-Type']).toEqual('text/plain');
    expect(res.statusCode).toBeFalsy();
    expect(res.body).toMatchSnapshot();
  });

  it.skip('robots.txt should return correct sitemap.xml path for domain linen.dev', async () => {
    const host = 'https://linen.dev/s/somthing';
    const res = createResponseStream();
    const context = {
      req: {
        headers: { host },
      },
      res,
    };
    await getServerSideProps(context);
    expect(res.headers['Content-Type']).toEqual('text/plain');
    expect(res.statusCode).toBeFalsy();
    expect(res.body).toMatchSnapshot();
  });
});

export {};
