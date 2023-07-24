const walk = require('../walk');
const unique = require('lodash.uniq');

function compare(type, selector) {
  if (Array.isArray(selector)) {
    return selector.includes(type);
  }
  return type === selector;
}

function findByType(tree, selector) {
  const nodes = [];

  walk(tree, (node) => {
    if (compare(node.type, selector)) {
      nodes.push(node);
    }
  });
  return nodes;
}

function findUserIds(tree) {
  return unique(findMentions(tree).map((node) => node.id));
}

function findMentions(tree) {
  const nodes = findByType(tree, ['user', 'signal']);
  return nodes.map((node) => node);
}

function findUrls(tree) {
  return unique(findByType(tree, 'url').map((node) => node.value));
}

module.exports = {
  urls: findUrls,
  usersIds: findUserIds,
  mentions: findMentions,
};
