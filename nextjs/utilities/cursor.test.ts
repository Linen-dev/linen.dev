import { decodeCursor, encodeCursor } from './cursor';

describe('cursor', () => {
  test('encode', () => {
    expect(encodeCursor('asc:1658883683710')).toBe('YXNjOjE2NTg4ODM2ODM3MTA=');
  });
  test('decode', () => {
    expect(decodeCursor('YXNjOjE2NTg4ODM2ODM3MTA=')).toBe('asc:1658883683710');
  });
});
