const Lexer = require('./Lexer');
const Parser = require('./Parser');

describe('Parser', () => {
  it('parsers headers', () => {
    const lexer = new Lexer('# foo');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const tree = parser.parse();
    expect(tree).toEqual([
      {
        type: 'header',
        depth: 1,
        children: [{ type: 'text', value: 'foo', source: 'foo' }],
        source: '# foo',
      },
    ]);
  });
});
