import { truncate } from './string';

describe('truncate', () => {
  it('truncates a string', () => {
    expect(truncate('foo', 2)).toEqual('fo...');
  });

  it('does not truncate a string if it is less than the limit', () => {
    expect(truncate('foo', 4)).toEqual('foo');
  });

  it('does not truncate a string if it equals the limit', () => {
    expect(truncate('foo', 3)).toEqual('foo');
  });
});
