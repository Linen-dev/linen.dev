import { tokenize } from './markdown';

describe('#tokenize', () => {
  it('returns tokens', async () => {
    const tokens = tokenize('# foo');
    const token = tokens[0];
    expect(token.type).toEqual('heading');
    expect(token.text).toEqual('foo');
  });
});
