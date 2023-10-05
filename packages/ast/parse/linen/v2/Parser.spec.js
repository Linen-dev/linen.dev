const Parser = require('./Parser');

describe('Parser', () => {
  it('parsers headers', () => {
    const parser = new Parser([{ type: 'header', depth: 1, value: 'foo' }]);
    const tree = parser.parse();
    expect(tree).toEqual([
      { type: 'header', depth: 1, children: [{ type: 'text', value: 'foo' }] },
    ]);
  });
});
