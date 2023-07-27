import { isUrlValid, isVideo } from './utilities';

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

describe('isVideo', () => {
  describe('when href is a video', () => {
    it('returns true', () => {
      expect(isVideo('https://www.youtube.com/embed/tgbNymZ7vqY')).toBe(true);
      expect(isVideo('https://youtube.com/embed/tgbNymZ7vqY')).toBe(true);
      expect(isVideo('https://www.youtube.com/watch')).toBe(true);
      expect(isVideo('https://youtube.com/watch')).toBe(true);
      expect(isVideo('https://youtu.be/tgbNymZ7vqY')).toBe(true);
      expect(isVideo('https://foo.com/bar.mov')).toBe(true);
    });
  });

  describe('when href is not a video', () => {
    it('returns true', () => {
      expect(isVideo('https://google.com/main.css')).toBe(false);
      expect(isVideo('https://google.com/main.js')).toBe(false);
    });
  });
});
