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

const preprocess = (message, allUsers) => {
  const tree = parse.linen(message);
  walk(tree, (node) => {
    if (node.type === 'user' || node.type === 'signal') {
      const user = allUsers.find((user) => user.id === node.id);
      if (user) {
        node.source = `${getTag(node.type)}${user.username}`;
        node.id = user.username;
      }
    }
  });
  return stringify(tree);
};

module.exports = preprocess;
