import { move, unionBy } from './array';

describe('#move', () => {
  it('moves an element of an array', () => {
    const array = [1, 2, 3];
    expect(move(array, 0, 0)).toEqual([1, 2, 3]);
    expect(move(array, 1, 1)).toEqual([1, 2, 3]);
    expect(move(array, 2, 2)).toEqual([1, 2, 3]);
    expect(move(array, 0, 1)).toEqual([2, 1, 3]);
    expect(move(array, 0, 2)).toEqual([2, 3, 1]);
    expect(move(array, 1, 0)).toEqual([2, 1, 3]);
    expect(move(array, 2, 0)).toEqual([3, 1, 2]);
  });

  describe('when from is bigger than the length of the array', () => {
    it('is a noop', () => {
      const array = [1, 2, 3];
      expect(move(array, 4, 0)).toEqual([1, 2, 3]);
    });
  });

  describe('when from is less than 0', () => {
    it('is a noop', () => {
      const array = [1, 2, 3];
      expect(move(array, -1, 0)).toEqual([1, 2, 3]);
    });
  });

  describe('when to is bigger than the length of the array', () => {
    it('is a noop', () => {
      const array = [1, 2, 3];
      expect(move(array, 0, 4)).toEqual([1, 2, 3]);
    });
  });

  describe('when to is less than 0', () => {
    it('is a noop', () => {
      const array = [1, 2, 3];
      expect(move(array, 0, -1)).toEqual([1, 2, 3]);
    });
  });
});

describe('#unionBy', () => {
  it('returns unique elements', () => {
    const users = unionBy(
      [{ id: '1', name: 'John' }],
      [{ id: '1', name: 'John' }],
      'id'
    );
    expect(users).toEqual([{ id: '1', name: 'John' }]);
  });
});
