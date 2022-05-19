import { generateSlug, totalUniqueSlugs } from 'lib/random-word-slugs';

describe('random-word-slugs', () => {
  it('simple slug on kebab', () => {
    for (let i = 15; i--; ) {
      const slug = generateSlug();
      // console.log(slug);
      expect(slug).toBeDefined();
      const parts = slug.split('-');
      expect(parts.length).toBe(3);
    }
  });
  it('should have more than 300k', () => {
    const totalSlugs = totalUniqueSlugs();
    // console.log(totalSlugs);
    expect(totalSlugs).toBeGreaterThan(300000);
  });
});
