import { getTweetId } from './utilities';

describe('getTweetId', () => {
  it('returns the tweet id', () => {
    expect(getTweetId('https://twitter.com/twitter/status/1234')).toBe('1234');
    expect(getTweetId('https://twitter.com/twitter/status/1234?s=5678')).toBe(
      '1234'
    );
  });
});
