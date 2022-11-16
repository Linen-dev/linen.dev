import { wordList } from './words';
const { adjective, noun } = wordList;
const numbers = Array.from(Array(99999).keys());
const words: any = { adjective, noun, numbers };
const order = ['adjective', 'noun', 'numbers'];

export function generateSlug() {
  const selected = order.map((partOfSpeech) => {
    const choices = words[partOfSpeech];
    return choices[Math.floor(Math.random() * choices.length)];
  });
  const slug = selected.join('-');
  return slug;
}

export function totalUniqueSlugs() {
  const numAdjectives = adjective.length;
  const numNouns = noun.length;
  const numNumbers = numbers.length;
  const nums: any = {
    adjective: numAdjectives,
    noun: numNouns,
    numbers: numNumbers,
  };
  const numWords = 3;
  const partsOfSpeech = order;
  let combos = 1;
  for (let i = 0; i < numWords; i++) {
    combos *= nums[partsOfSpeech[i]];
  }
  return combos;
}
