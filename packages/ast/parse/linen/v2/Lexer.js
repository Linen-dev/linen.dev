class Lexer {
  constructor(input) {
    this.input = input;
    this.tokens = [];
  }
  tokenize() {
    const lines = this.input.split('\n');
    let inList = false;
    let listItems = [];
    let listItemStartIndex = 0;
    lines.forEach((line, index) => {
      if (line.startsWith('-')) {
        if (!inList) {
          inList = true;
          listItemStartIndex = index; // Record start index of list
        }
        listItems.push(line.substring(2).trim());
      } else if (inList) {
        const source = lines.slice(listItemStartIndex, index).join('\n');
        this.tokens.push({
          type: 'list',
          ordered: false,
          source,
          value: listItems,
        });
        inList = false;
        listItems = [];
      }

      if (inList && index === lines.length - 1) {
        const source = lines.slice(listItemStartIndex).join('\n');
        this.tokens.push({
          type: 'list',
          ordered: false,
          value: listItems,
          source,
        });
      }

      if (line.startsWith('#')) {
        const depth = line.lastIndexOf('#') + 1;
        const value = line.substring(depth).trim();
        this.tokens.push({ type: 'header', depth, value, source: line });
      }
    });
    return this.tokens;
  }
}

module.exports = Lexer;
