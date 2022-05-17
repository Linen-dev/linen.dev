import { generateSlug, RandomWordOptions } from 'random-word-slugs';

export const numberOfWords = 3;
export const options: RandomWordOptions<3> = {
  categories: {
    noun: ['animals'],
  },
  partsOfSpeech: ['adjective', 'adjective', 'noun'],
};

export function generateRandomWordSlug() {
  return generateSlug(numberOfWords, options);
}
