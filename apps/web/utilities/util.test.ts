import { cleanUpUrl } from './util';

describe('cleanUpUrl', () => {
  test('clean up customDomain', () => {
    expect(cleanUpUrl('/?customDomain=1')).toBe('/');
    expect(cleanUpUrl('/?customDomain=1&something=2')).toBe('/?something=2');
    expect(cleanUpUrl('/')).toBe('/');
    expect(cleanUpUrl()).toBe(undefined);
  });
});
