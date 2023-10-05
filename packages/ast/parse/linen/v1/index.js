const tokenize = require('./tokenize');
const listify = require('./listify');
const expand = require('./expand');
const linkify = require('./linkify');
const normalize = require('./normalize');

// Linen's message parser is a multipass parser
// 1st pass tokenizes the input into text, code and user nodes
// 2nd pass finds lists
// 3rd pass finds bold, italic and strike tags
// 4th pass finds links
// 5th step normalizes tokens

function parse(input) {
  let tokens;
  tokens = tokenize(input);
  tokens = listify(tokens);
  tokens = expand(tokens);
  tokens = linkify(tokens);
  return tokens.map(normalize);
}

module.exports = function (input) {
  return { type: 'root', source: input, children: parse(input) };
};
