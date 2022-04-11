import { generateToken } from './token';

describe('#generateToken', () => {
  it('returns a token', () => {
    const token = generateToken();
    expect(typeof token).toEqual('string');
  });
});
