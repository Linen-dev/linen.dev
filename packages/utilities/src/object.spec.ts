import { clean } from './object';

describe('#clean', () => {
  it('removes falsy values', () => {
    expect(
      clean({
        foo: 'bar',
        bar: null,
        baz: 0,
        qux: '',
        quux: undefined,
      })
    ).toEqual({
      foo: 'bar',
    });
  });
});
