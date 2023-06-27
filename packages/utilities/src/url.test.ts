import { stripProtocol, normalizeUrl, cleanUpUrl, getThreadUrl } from './url';

describe('cleanUpUrl', () => {
  test('clean up customDomain', () => {
    expect(cleanUpUrl('/?customDomain=1')).toBe('/');
    expect(cleanUpUrl('/?customDomain=1&something=2')).toBe('/?something=2');
    expect(cleanUpUrl('/')).toBe('/');
    expect(cleanUpUrl()).toBe(undefined);
  });
});

describe('#stripProtocol', () => {
  describe('when url starts with https://', () => {
    it('removes the protocol', () => {
      expect(stripProtocol('https://example.com')).toBe('example.com');
    });
  });

  describe('when url starts with http://', () => {
    it('removes the protocol', () => {
      expect(stripProtocol('http://example.com')).toBe('example.com');
    });
  });

  describe('when url does not start with http:// or https://', () => {
    it('returns the url as is', () => {
      expect(stripProtocol('example.com')).toBe('example.com');
    });
  });
});

describe('#normalizeUrl', () => {
  describe('when url ends with ..jpg', () => {
    it('keeps a single dot', () => {
      expect(normalizeUrl('https://avatars.slack.com/avatar..jpg')).toBe(
        'https://avatars.slack.com/avatar.jpg'
      );
    });
  });

  describe('when url ends with ..png', () => {
    it('keeps a single dot', () => {
      expect(normalizeUrl('https://avatars.slack.com/avatar..png')).toBe(
        'https://avatars.slack.com/avatar.png'
      );
    });
  });

  describe('when url ends with ..jpeg', () => {
    it('keeps a single dot', () => {
      expect(normalizeUrl('https://avatars.slack.com/avatar..jpeg')).toBe(
        'https://avatars.slack.com/avatar.jpeg'
      );
    });
  });

  describe('when the url is valid', () => {
    it('does not replace anything', () => {
      expect(normalizeUrl('https://avatars.slack.com/avatar.jpg')).toBe(
        'https://avatars.slack.com/avatar.jpg'
      );
    });
  });
});

describe('#getThreadUrl', () => {
  it('returns the url of a thread', () => {
    const url = getThreadUrl({
      isSubDomainRouting: false,
      settings: { communityName: 'linen' },
      slug: 'test',
      incrementId: 1,
      LINEN_URL: 'https://www.linen.dev',
    });
    expect(url).toBe('https://www.linen.dev/s/linen/t/1/test');
  });
});
