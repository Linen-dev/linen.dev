import { getCommunityName } from '../../utilities/middlewareHelper';

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
