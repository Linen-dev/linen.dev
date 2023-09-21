import { getReferences, parseBody } from '.';
import { accounts } from '@linen/types';

describe('#parseBody', () => {
  it('returns a body of a message', async () => {
    const response = {
      text: 'Lorem ipsum dolor sit amet.',
      sourceDocuments: [
        {
          pageContent: 'Hello, world!',
          metadata: {
            source: 'https://foo.bar',
            loc: {
              lines: {
                from: 0,
                to: 10,
              },
            },
          },
        },
      ],
    };
    const body = await parseBody(response, {
      account: {} as accounts,
      communityName: 'foo',
    });
    expect(body.replace(/\n/g, ' ')).toEqual(
      `Lorem ipsum dolor sit amet.  References:  - https://foo.bar`
    );
  });
});

describe('#getReferences', () => {
  it('returns unique references', () => {
    const documents = [
      {
        pageContent: 'Hello, world!',
        metadata: {
          source: 'https://foo.bar',
          loc: {
            lines: {
              from: 0,
              to: 5,
            },
          },
        },
      },
      {
        pageContent: 'Hello, world!',
        metadata: {
          source: 'https://foo.bar',
          loc: {
            lines: {
              from: 7,
              to: 10,
            },
          },
        },
      },
    ];
    expect(getReferences(documents)).toEqual(['https://foo.bar']);
  });
});
