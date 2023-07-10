import { timeAgo } from './date';

describe('#timeAgo', () => {
  it('returns a text', () => {
    expect(timeAgo(new Date().toISOString())).toEqual('less than a minute ago');
  });
});
