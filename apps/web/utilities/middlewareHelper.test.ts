import { getCommunityName, rewrite } from './middlewareHelper';

describe('getCommunityName', () => {
  const isProd = true;
  it('gets community name from subdomain', () => {
    expect(getCommunityName(isProd, 'osquery.linen.dev')).toEqual('osquery');
  });

  it('uses redirect url as communityName', () => {
    expect(getCommunityName(isProd, 'papercups-io.ngrok.io')).toEqual(
      'papercups-io.ngrok.io'
    );
  });
});

describe('rewrite', () => {
  const paths = [
    's/community/c/default',
    'c/default',
    'signup',
    'signin',
    'forgot-password',
    'reset-password',
    'api',

    '_next',
  ];

  it('linen.dev/* should not redirect', () => {
    const result = paths.map((path) => {
      const url = new URL(`https://linen.dev/${path}`);
      const response = rewrite({
        hostname: url.host,
        pathname: url.pathname,
        url,
      });
      return response;
    });
    result.forEach((e) => expect(e).toBeUndefined());
  });

  it('*.vercel.app/* should not redirect', () => {
    const result = paths.map((path) => {
      const url = new URL(`https://something.vercel.app/${path}`);
      const response = rewrite({
        hostname: url.host,
        pathname: url.pathname,
        url,
      });
      return response;
    });
    result.forEach((e) => expect(e).toBeUndefined());
  });

  it('custom.domain.com should redirect', () => {
    const paths = ['api', '_next'];

    const result = paths.map((path) => {
      const url = new URL(`https://custom.domain.com/${path}`);
      const response = rewrite({
        hostname: url.host,
        pathname: url.pathname,
        url,
      });
      return response;
    });
    result.forEach((e) => expect(e).toBeUndefined());

    const url = new URL(`https://custom.domain.com`);
    // 's/community/c/default',
    // 'c/default',
    expect(
      rewrite({
        hostname: url.host,
        pathname: '/s/community/c/default',
        url,
      })
    ).toStrictEqual({
      rewrite:
        'https://custom.domain.com/s/custom.domain.com/s/community/c/default?customDomain=1',
    });

    expect(
      rewrite({
        hostname: url.host,
        pathname: '/c/default',
        url,
      })
    ).toStrictEqual({
      rewrite:
        'https://custom.domain.com/s/custom.domain.com/c/default?customDomain=1&customDomain=1',
    });

    const signPaths = [
      '/signup',
      '/signin',
      '/forgot-password',
      '/reset-password',
    ];
    signPaths.forEach((path) => {
      expect(
        rewrite({
          hostname: url.host,
          pathname: path,
          url,
        })
      ).toBeUndefined();
    });
  });

  it('slack-chats.kotlinlang.org', () => {
    const url = new URL(`https://slack-chats.kotlinlang.org/robots.txt`);
    const response = rewrite({
      hostname: url.host,
      pathname: url.pathname,
      url,
    });
    expect(response).toStrictEqual({
      rewrite: `${process.env.LINEN_STATIC_CDN}/sitemap/slack-chats.kotlinlang.org/robots.txt`,
    });
  });
});
