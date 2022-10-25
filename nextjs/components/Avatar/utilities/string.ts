function isLetter(character: string): boolean {
  return character.toLowerCase() !== character.toUpperCase();
}

export function getLetter(text: string): string {
  const character = text.trim().slice(0, 1).toLowerCase();
  if (isLetter(character)) {
    return character;
  }
  return 'u';
}
