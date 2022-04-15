import { tokenize } from './lexer';

describe('#tokenize', () => {
  it('returns an array of tokens', () => {
    const input = 'Hello, world!';
    const expected = [{ type: 'text', value: 'Hello, world!' }];
    expect(tokenize(input)).toEqual(expected);
  });
});
