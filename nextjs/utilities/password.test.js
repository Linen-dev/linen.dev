import { generateHash, generateSalt, secureCompare } from './password';

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

describe('#secureCompare', () => {
  it('compares strings', () => {
    expect(secureCompare('a', 'a')).toEqual(true);
    expect(secureCompare('a', 'b')).toEqual(false);
    expect(secureCompare('lorem ipsum', 'lorem ipsum')).toEqual(true);
    expect(secureCompare('ąęłó', 'ąęłó')).toEqual(true);
    expect(secureCompare('世界好你', '世界好你')).toEqual(true);
    expect(secureCompare('lorem', 'lorem ipsum')).toEqual(false);
  });
});
