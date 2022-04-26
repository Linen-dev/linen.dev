import { stripProtocol } from './url';

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
