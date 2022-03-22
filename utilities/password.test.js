import { generateSalt } from './password';

describe('#generateSalt', () => {
  it('returns a random string', async () => {
    const salt = generateSalt();
    expect(typeof salt).toEqual('string');
    expect(generateSalt()).not.toEqual(generateSalt());
  });
});
