import { serialize } from './dynamoCache';

describe('dynamo cache serializer', () => {
  test('function with multiple parameters', () => {
    expect(serialize(1, 2, 3)).toBe('1,2,3');
  });
  test('function with 1 parameters', () => {
    expect(serialize(1)).toBe('1');
  });
  test('function with multiple mix type parameters', () => {
    expect(serialize('1', 2, true)).toBe('1,2,true');
  });
  test('function with 1 string parameters', () => {
    expect(serialize('1')).toBe('1');
  });
  test('function with 1 destructured object', () => {
    expect(serialize({ o: 1 })).toBe('o=1');
  });
  test('function with 2 destructured objects', () => {
    expect(serialize({ o: 1 }, { o: 1 })).toBe('o=1,o=1');
  });
  test('function with 1 destructured objects with objects', () => {
    expect(serialize({ o: 1, e: { o: 1 } })).toBe('o=1,e=[object Object]');
  });
  test('function with 2 destructured objects with objects', () => {
    expect(serialize({ o: 1, e: { o: 1 } }, { o: 1, e: { o: 1 } })).toBe(
      'o=1,e=[object Object],o=1,e=[object Object]'
    );
  });
});
