import { normalizeVideoUrl } from './utilities';

describe('normalizeVideoUrl', () => {
  describe('when href is a youtube watch url', () => {
    it('returns a youtube embed url', () => {
      expect(
        normalizeVideoUrl('https://www.youtube.com/watch?v=tgbNymZ7vqY')
      ).toBe('https://www.youtube.com/embed/tgbNymZ7vqY');
      expect(normalizeVideoUrl('https://youtube.com/watch?v=tgbNymZ7vqY')).toBe(
        'https://www.youtube.com/embed/tgbNymZ7vqY'
      );
    });
  });

  describe('when href is a youtube short url', () => {
    it('returns a youtube embed url', () => {
      expect(normalizeVideoUrl('https://youtu.be/tgbNymZ7vqY?t=1234')).toBe(
        'https://www.youtube.com/embed/tgbNymZ7vqY?t=1234'
      );
    });
  });

  describe('when href is a youtube embed url', () => {
    it('returns the same url', () => {
      expect(
        normalizeVideoUrl('https://www.youtube.com/embed/tgbNymZ7vqY')
      ).toBe('https://www.youtube.com/embed/tgbNymZ7vqY');
      expect(normalizeVideoUrl('https://youtube.com/embed/tgbNymZ7vqY')).toBe(
        'https://youtube.com/embed/tgbNymZ7vqY'
      );
    });
  });
});
