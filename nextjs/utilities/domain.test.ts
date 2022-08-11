import { getCurrentUrl } from './domain';

describe('#getCurrentUrl', () => {
  it('returns http://localhost:3000 in local env', () => {
    expect(getCurrentUrl()).toBe(process.env.NEXTAUTH_URL);
  });
});
