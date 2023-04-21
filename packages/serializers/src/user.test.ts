import { username } from './user';

describe('#username', () => {
  it('returns a username based on the display name', () => {
    expect(username('John')).toEqual('john');
    expect(username('John Doe')).toEqual('johndoe');
    expect(username('Ignacio Da Silva')).toEqual('ignaciodasilva');
  });

  it('returns null if display name is not present', () => {
    expect(username(null)).toEqual(null);
    expect(username('')).toEqual(null);
  });
});
