const Lexer = require('./Lexer');

describe('Lexer', () => {
  it('tokenizes headers', () => {
    const lexer = new Lexer('# foo');
    const tokens = lexer.tokenize();
    expect(tokens).toEqual([
      { type: 'header', depth: 1, value: 'foo', source: '# foo' },
    ]);
  });

  it('tokenizes a list with single item', () => {
    const lexer = new Lexer('- foo');
    const tokens = lexer.tokenize();
    expect(tokens).toEqual([
      { type: 'list', value: ['foo'], ordered: false, source: '- foo' },
    ]);
  });

  it('tokenizes a list with multiple items', () => {
    const lexer = new Lexer('- foo\n- bar');
    const tokens = lexer.tokenize();
    expect(tokens).toEqual([
      {
        type: 'list',
        value: ['foo', 'bar'],
        ordered: false,
        source: '- foo\n- bar',
      },
    ]);
  });
});
