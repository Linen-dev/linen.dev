const Lexer = require('./Lexer');
const Parser = require('./Parser');

module.exports = function (input) {
  const lexer = new Lexer(input);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const tree = parser.parse();
  return { type: 'root', source: input, children: tree };
};
