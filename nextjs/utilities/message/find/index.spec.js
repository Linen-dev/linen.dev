import { findUserIds } from '.';

describe('findUserIds', () => {
  it('returns user ids from given tree', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'user',
          id: '1234',
          source: '@1234',
        },
        {
          type: 'bold',
          children: [
            {
              type: 'user',
              id: '5678',
              source: '@5678',
            },
          ],
        },
      ],
    };

    expect(findUserIds(tree)).toEqual(['1234', '5678']);
  });
});
