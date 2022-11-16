import { buildURL } from './http';

describe('buildURL', () => {
  it('returns the url when there are no params', () => {
    expect(buildURL('/foo')).toEqual('/foo');
  });

  it('returns the url when the params object is empty', () => {
    expect(buildURL('/foo', {})).toEqual('/foo');
  });

  it('returns a url with one parameter', () => {
    expect(buildURL('/foo', { bar: '' })).toEqual('/foo?bar=');
    expect(buildURL('/foo', { bar: 'baz' })).toEqual('/foo?bar=baz');
  });

  it('returns a url with two parameters', () => {
    expect(buildURL('/foo', { bar: 'baz', qux: 'quux' })).toEqual(
      '/foo?bar=baz&qux=quux'
    );
  });
});
