import { truncate } from './string';

describe('#truncate', () => {
  it('truncates text to 223 characters', () => {
    const text = 'foo'.repeat(100);
    const truncated = truncate(text);
    expect(truncated.length).toEqual(223);
    expect(truncated.endsWith('...')).toBeTruthy();
  });

  describe('when text is shorter than 220 characters', () => {
    it('does not truncate it', () => {
      const text = 'foo';
      expect(truncate(text)).toEqual(text);
    });
  });
});
