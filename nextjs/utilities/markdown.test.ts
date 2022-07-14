import { tokenize } from './markdown';

describe('#tokenize', () => {
  it('returns tokens', async () => {
    const tokens = tokenize('# foo');
    const token = tokens[0];
    expect(token.type).toEqual('heading');
    expect(token.text).toEqual('foo');
  });

  it('returns an em token', async () => {
    const tokens = tokenize('foo *bar* baz');
    const token = tokens[0];
    expect(token.type).toEqual('paragraph');
    expect(token.tokens).toEqual([
      { type: 'text', text: 'foo ', raw: 'foo ' },
      {
        type: 'em',
        text: 'bar',
        raw: '*bar*',
        tokens: [
          {
            type: 'text',
            text: 'bar',
            raw: 'bar',
          },
        ],
      },
      { type: 'text', text: ' baz', raw: ' baz' },
    ]);
  });
});
