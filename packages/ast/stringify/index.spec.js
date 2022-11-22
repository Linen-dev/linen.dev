const stringify = require('.');

describe('#stringify', () => {
  it('stringifies an abstract syntax tree', () => {
    const tree = { type: 'text', value: 'foo' };
    expect(stringify(tree)).toEqual('foo');
  });
});
