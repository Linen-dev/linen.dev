const parse = require('../parse');
const walk = require('../walk');

const IGNORED_TYPES = ['root', 'text'];

const previewable = (message) => {
  let boolean = false;
  const tree = parse.linen(message);
  walk(tree, (node) => {
    if (!IGNORED_TYPES.includes(node.type)) {
      boolean = true;
    }
  });
  return boolean;
};

module.exports = previewable;
