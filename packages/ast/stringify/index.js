const walk = require('../walk');

function stringify(tree) {
  let output = '';

  walk(tree, (node) => {
    if (node.used) {
      return;
    }
    node.used = true;
    if (node.type === 'root') {
      return;
    }
    if (node.type === 'bold') {
      output += '*';
      node.children.forEach((child) => {
        output += stringify(child);
      });
      output += '*';
    }

    if (node.type === 'italic') {
      output += '_';
      node.children.forEach((child) => {
        output += stringify(child);
      });
      output += '_';
    }

    if (node.type === 'strike') {
      output += '~';
      node.children.forEach((child) => {
        output += stringify(child);
      });
      output += '~';
    }

    if (node.type === 'code') {
      output += node.source;
    }

    if (node.type === 'pre') {
      output += node.source;
    }

    if (node.type === 'quote') {
      output += '> ';
      node.children.forEach((child) => {
        output += stringify(child);
      });
    }

    if (node.type === 'header') {
      output += `${'#'.repeat(node.depth)} `;
      node.children.forEach((child) => {
        output += stringify(child);
      });
    }

    if (node.type === 'list') {
      if (node.ordered) {
        output +=
          node.children
            .map((child, index) => `${index + 1}. ${stringify(child)}`)
            .join('\n') + '\n';
      } else {
        output +=
          node.children.map((child) => `- ${stringify(child)}`).join('\n') +
          '\n';
      }
    }

    if (node.type === 'user') {
      output += node.source;
    }

    if (node.type === 'signal') {
      output += node.source;
    }

    if (node.type === 'url') {
      output += node.source;
    }

    if (node.type === 'text') {
      output += node.value;
    }
  });

  return output;
}

module.exports = stringify;
