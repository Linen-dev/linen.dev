const find = require('.');

describe('#find.usersIds', () => {
  it('returns user ids from given tree', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'user',
          id: '1',
          source: '@1',
        },
        {
          type: 'bold',
          children: [
            {
              type: 'user',
              id: '2',
              source: '@2',
            },
            {
              type: 'signal',
              id: '3',
              source: '!3',
            },
            {
              type: 'signal',
              id: '1',
              source: '!1',
            },
          ],
        },
      ],
    };

    expect(find.usersIds(tree)).toEqual(['1', '2', '3']);
  });
});

describe('#find.mentions', () => {
  it('returns user ids from given tree', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'user',
          id: '1',
          source: '@1',
        },
        {
          type: 'bold',
          children: [
            {
              type: 'user',
              id: '2',
              source: '@2',
            },
            {
              type: 'signal',
              id: '3',
              source: '!3',
            },
            {
              type: 'signal',
              id: '1',
              source: '!1',
            },
          ],
        },
      ],
    };

    expect(find.mentions(tree)).toEqual([
      {
        type: 'user',
        id: '1',
        source: '@1',
      },
      {
        type: 'user',
        id: '2',
        source: '@2',
      },
      {
        type: 'signal',
        id: '3',
        source: '!3',
      },
      {
        type: 'signal',
        id: '1',
        source: '!1',
      },
    ]);
  });
});
