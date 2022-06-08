import { getHomeUrl, getHomeText } from './home';
import { SerializedAccount, CommunityType } from 'serializers/account';

function createAccount(options: object): SerializedAccount {
  return {
    id: '1',
    premium: false,
    slackSyncStatus: 'synced',
    communityType: CommunityType.slack,
    ...options,
  };
}

describe('getHomeUrl', () => {
  it('returns the correct url for a premium account', () => {
    const account = createAccount({
      premium: true,
      redirectDomain: 'example.com',
    });
    expect(getHomeUrl(account)).toEqual('https://example.com');
  });

  it('returns the correct url for a slack account', () => {
    const account = createAccount({
      slackDomain: 'example',
    });
    expect(getHomeUrl(account)).toEqual('/s/example');
  });

  it('returns the correct url for a discord account', () => {
    const account = createAccount({
      discordServerId: 'example',
    });
    expect(getHomeUrl(account)).toEqual('/d/example');
  });

  it('returns the correct url for a non-premium account', () => {
    const account = createAccount({
      premium: false,
    });
    expect(getHomeUrl(account)).toEqual('/');
  });

  it('returns the correct url for a non-premium account with a redirect domain', () => {
    const account = createAccount({
      premium: false,
      redirectDomain: 'example.com',
    });
    expect(getHomeUrl(account)).toEqual('/');
  });

  it('returns the correct url when there is no account', () => {
    expect(getHomeUrl()).toEqual('/');
  });
});

describe('getHomeText', () => {
  it('returns null for / as the url', () => {
    expect(getHomeText('/')).toEqual(null);
  });

  it('returns the correct text for a url thats starts with https://', () => {
    expect(getHomeText('https://example.com')).toEqual('example.com');
  });

  it('returns the linen.dev url for other urls', () => {
    expect(getHomeText('/s/example')).toEqual('linen.dev/s/example');
    expect(getHomeText('/d/example')).toEqual('linen.dev/d/example');
  });
});
