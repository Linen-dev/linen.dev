import { isSubdomainbasedRouting, createSlug } from './util';

describe('isSubdomainCommunity', () => {
  describe('subdomain', () => {
    it('returns true for customer redirect', () => {
      expect(isSubdomainbasedRouting('osquery.fleetdm.com')).toEqual(true);
    });

    it('returns true for localhost subdomain', () => {
      expect(isSubdomainbasedRouting('osquery.localhost:3000')).toEqual(true);
    });
  });

  describe('no subdomain', () => {
    it('returns true for customer redirect', () => {
      expect(isSubdomainbasedRouting('linen.dev')).toEqual(false);
    });

    it('returns true for localhost subdomain', () => {
      expect(isSubdomainbasedRouting('localhost:3000')).toEqual(false);
    });
  });

  describe('handles www', () => {
    it('returns false for www.linen.dev', () => {
      expect(isSubdomainbasedRouting('www.linen.dev')).toEqual(false);
    });

    it('returns false for www.localhost', () => {
      expect(isSubdomainbasedRouting('www.localhost:3000')).toEqual(false);
    });
  });

  describe('handles vercel app', () => {
    it('returns false for vercel.app', () => {
      expect(
        isSubdomainbasedRouting('linen-dev-hnhpiw57p-papercups.vercel.app')
      ).toEqual(false);
    });
  });

  describe('handle empty string', () => {
    it('returns false', () => {
      expect(isSubdomainbasedRouting('')).toEqual(false);
    });
  });

  describe('handle full url', () => {
    it('it returns true for www.papercups.io', () => {
      expect(isSubdomainbasedRouting('www.papercups.io')).toEqual(true);
    });
  });
});

const longString = 'THIS Is a really long String'.repeat(100);

describe('slugify', () => {
  it('join spaces', () => {
    expect(createSlug(' something space  ')).toEqual('something-space');
  });
  it('removes emojis', () => {
    expect(createSlug('something 😉 space ')).toEqual('something-space');
  });
  it('replaces underscores', () => {
    expect(createSlug('something_space ')).toEqual('something-space');
  });
  it('has default string', () => {
    expect(createSlug(' ')).toEqual('conversation');
  });
  it('handles long strings', () => {
    expect(createSlug(longString).length).toEqual(60);
  });

  it('handles punctunations', () => {
    expect(createSlug('! @ #$* *#! <> something space @*$(& ')).toEqual(
      'something-space'
    );
  });
});
