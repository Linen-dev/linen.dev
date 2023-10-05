class Lexer {
  constructor(input) {
    this.input = input;
    this.tokens = [];
  }
  tokenize() {
    const lines = this.input.split('\n');
    for (let line of lines) {
      if (line.startsWith('#')) {
        const depth = line.lastIndexOf('#') + 1;
        const value = line.substring(depth).trim();
        this.tokens.push({ type: 'header', depth, value });
      }
    }
    return this.tokens;
  }
}

module.exports = Lexer;
