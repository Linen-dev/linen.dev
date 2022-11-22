const tokenize = require('./tokenize');
const split = require('./split');
const expand = require('./expand');
const normalize = require('./normalize');

// Linen's message parser is a multipass parser
// 1st pass tokenizes the input into text, code and user nodes
// 2nd pass splits text nodes to text nodes or urls
// 3rd pass deduces bold, italic and strike tags within text
// 4th step normalizes tokens

function parse(input) {
  let tokens;
  tokens = tokenize(input);
  tokens = split(tokens);
  tokens = expand(tokens);
  return tokens.map(normalize);
}

module.exports = function (input) {
  return { type: 'root', source: input, children: parse(input) };
};
