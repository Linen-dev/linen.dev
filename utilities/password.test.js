import { generateHash, generateSalt } from './password';

describe('#generateSalt', () => {
  it('returns a random string', async () => {
    const salt = generateSalt();
    expect(typeof salt).toEqual('string');
    expect(generateSalt()).not.toEqual(generateSalt());
  });
});

describe('#generateHash', () => {
  it('returns a hash', () => {
    const salt = generateSalt();
    const hash = generateHash('password', salt);
    expect(typeof hash).toEqual('string');
  });
});
