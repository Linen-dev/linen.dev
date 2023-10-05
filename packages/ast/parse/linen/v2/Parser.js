class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse() {
    const tree = [];
    while (this.current < this.tokens.length) {
      const token = this.tokens[this.current];
      if (token.type === 'header') {
        tree.push(this.parseHeader());
      }
    }
    return tree;
  }

  parseHeader() {
    const token = this.tokens[this.current];
    this.current += 1;
    return {
      type: 'header',
      depth: token.depth,
      children: [{ type: 'text', value: token.value }],
    };
  }
}

module.exports = Parser;
