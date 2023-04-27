const parse = require('../parse');
const stringify = require('../stringify');
const walk = require('../walk');

function getTag(type) {
  switch (type) {
    case 'user':
      return '@';
    case 'signal':
      return '!';
  }
  return '';
}

const postprocess = (message, allUsers) => {
  const tree = parse.linen(message);
  walk(tree, (node) => {
    if (node.type === 'user' || node.type === 'signal') {
      const user = allUsers.find((user) => user.username === node.id);
      if (user) {
        node.source = `${getTag(node.type)}${user.id}`;
        node.id = user.id;
      } else {
        node.type = 'text';
        node.value = node.source.substr(1);
      }
    }
  });
  return stringify(tree);
};

module.exports = postprocess;
