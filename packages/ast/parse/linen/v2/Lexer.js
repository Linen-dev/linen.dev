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
    let inText = false;
    let textContent = '';
    let textStartIndex = 0;
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = undefined;
    let codeBlockStartIndex = 0;
    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock) {
          const source = lines.slice(codeBlockStartIndex, index + 1).join('\n');
          this.tokens.push({
            type: 'pre',
            value: codeContent.trimEnd(),
            source,
            language: codeLanguage,
          });
          codeLanguage = undefined;
          codeContent = '';
        } else {
          codeBlockStartIndex = index;
          codeLanguage = line.length > 3 ? line.substring(3) : undefined;
        }
      } else if (inCodeBlock) {
        codeContent += line + '\n';
      } else if (line.startsWith('-')) {
        if (!inList) {
          inList = true;
          listItemStartIndex = index;
        }
        listItems.push(line.substring(2).trim());

        if (index === lines.length - 1) {
          const source = lines.slice(listItemStartIndex).join('\n');
          this.tokens.push({
            type: 'list',
            ordered: false,
            value: listItems,
            source,
          });
        }
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
      } else if (line.startsWith('#')) {
        const depth = line.lastIndexOf('#') + 1;
        const value = line.substring(depth).trim();
        this.tokens.push({ type: 'header', depth, value, source: line });
      } else if (line) {
        if (!inText) {
          inText = true;
          textStartIndex = index;
        }
        textContent += line.trim() + '\n';
        if (index === lines.length - 1) {
          const source = lines.slice(textStartIndex).join('\n');
          this.tokens.push({
            type: 'text',
            value: textContent.trim(),
            source,
          });
        }
      } else if (inText) {
        const source = lines.slice(textStartIndex, index).join('\n');
        this.tokens.push({
          type: 'text',
          value: textContent.trim(),
          source,
        });
        inText = false;
        textContent = '';
      }
    });
    return this.tokens;
  }
}

module.exports = Lexer;
