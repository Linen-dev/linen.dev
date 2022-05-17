import {
  generateSlug,
  totalUniqueSlugs,
  RandomWordOptions,
} from 'random-word-slugs';

const numberOfWords = 3;
const options: RandomWordOptions<3> = {
  categories: {
    noun: ['animals'],
  },
  partsOfSpeech: ['adjective', 'adjective', 'noun'],
};

describe('random-word-slugs', () => {
  it('simple slug on kebab', () => {
    for (let i = 15; i--; ) {
      const slug = generateSlug(numberOfWords, options);
      console.log(slug);
      expect(slug).toBeDefined();
      const parts = slug.split('-');
      expect(parts.length).toBe(numberOfWords);
    }
  });
  it('should have more than 300k', () => {
    const totalSlugs = totalUniqueSlugs(numberOfWords, options);
    console.log(totalSlugs);
    expect(totalSlugs).toBeGreaterThan(300000);
  });
});
