import {
  getHostFromHeaders,
  isSubdomainbasedRouting,
  isSubdomainNotAllowed,
} from './domain';

describe('#getHostFromHeaders', () => {
  it('returns www.linen.dev', () => {
    expect(getHostFromHeaders()).toBe('www.linen.dev');
  });

  it('when request is from desktop, it returns www.linen.dev', () => {
    expect(
      getHostFromHeaders({
        origin: 'tauri://localhost',
      })
    ).toBe('www.linen.dev');
  });
  it('returns localhost', () => {
    expect(
      getHostFromHeaders({
        host: 'localhost',
      })
    ).toBe('localhost');
  });
});

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

describe('isSubdomainNotAllowed', () => {
  it('www.linen.dev should be false', () => {
    expect(isSubdomainNotAllowed('www.linen.dev')).toEqual(false);
  });
  it('whatever.linen.dev should be true', () => {
    expect(isSubdomainNotAllowed('whatever.linen.dev')).toEqual(true);
  });
  it('linen.dev should be false', () => {
    expect(isSubdomainNotAllowed('linen.dev')).toEqual(false);
  });
  it('localhost should be false', () => {
    expect(isSubdomainNotAllowed('localhost')).toEqual(false);
  });
  it('www.localhost should be false', () => {
    expect(isSubdomainNotAllowed('www.localhost')).toEqual(false);
  });
});
