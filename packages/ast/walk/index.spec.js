const walk = require('.');

describe('walk', () => {
  it('walks through a tree', () => {
    const tree = { type: 'root', children: [{ type: 'text', value: 'foo' }] };
    const nodes = [];
    walk(tree, (node) => {
      nodes.push(node);
    });
    expect(nodes.length).toEqual(2);
    expect(nodes[0].type).toEqual('root');
    expect(nodes[1].type).toEqual('text');
  });
});
