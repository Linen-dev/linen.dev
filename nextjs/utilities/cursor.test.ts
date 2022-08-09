import { decodeCursor, encodeCursor } from './cursor';

describe('cursor', () => {
  test('encode', () => {
    expect(encodeCursor('asc:lt:1658883683710')).toBe(
      'YXNjOmx0OjE2NTg4ODM2ODM3MTA='
    );
  });
  test('decode', () => {
    expect(decodeCursor('YXNjOmx0OjE2NTg4ODM2ODM3MTA=')).toMatchObject({
      sort: 'asc',
      direction: 'lt',
      sentAt: '1658883683710',
    });
  });
});
