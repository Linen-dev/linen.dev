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
      } else if (token.type === 'list') {
        tree.push(this.parseList());
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
      children: [{ type: 'text', value: token.value, source: token.value }],
      source: token.source,
    };
  }

  parseList() {
    const token = this.tokens[this.current];

    this.current += 1;

    return {
      type: 'list',
      children: token.value.map((text) => {
        return {
          type: 'item',
          source: text,
          children: [{ type: 'text', value: text, source: text }],
        };
      }),
      ordered: token.ordered,
      source: token.source,
    };
  }
}

module.exports = Parser;
