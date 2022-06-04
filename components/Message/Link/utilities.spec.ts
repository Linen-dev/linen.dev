import { isImage, isUrlValid } from './utilities';

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

describe('isImage', () => {
  describe('when href is an image', () => {
    it('returns true', () => {
      expect(isImage('http://google.com/image.png')).toBe(true);
      expect(isImage('https://google.com/image.png')).toBe(true);
    });
  });

  describe('when href is not an image', () => {
    it('returns false', () => {
      expect(isImage('http://google.com/main.css')).toBe(false);
      expect(isImage('https://google.com/main.css')).toBe(false);
      expect(isImage('https://google.com/main')).toBe(false);
    });
  });
});
