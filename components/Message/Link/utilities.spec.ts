import { isUrlValid } from './utilities';

describe('isUrlValid', () => {
  describe('when url is valid', () => {
    it('returns true', () => {
      expect(isUrlValid('http://google.com')).toBe(true);
      expect(isUrlValid('https://google.com')).toBe(true);
    });
  });

  describe('when url is invalid', () => {
    it('returns false', () => {
      expect(isUrlValid('http://-how-to-register')).toBe(false);
      expect(isUrlValid('https://-how-to-register')).toBe(false);
    });
  });
});
