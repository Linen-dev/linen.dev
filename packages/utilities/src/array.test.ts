import { unionBy } from './array';

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
