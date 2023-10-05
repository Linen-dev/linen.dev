const Lexer = require('./Lexer');

describe('Lexer', () => {
  it('tokenizes headers', () => {
    const lexer = new Lexer('# foo');
    const tokens = lexer.tokenize();
    expect(tokens).toEqual([{ type: 'header', depth: 1, value: 'foo' }]);
  });
});
