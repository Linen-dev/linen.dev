import walk from '../walk';

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

export function findUserIds(tree) {
  const nodes = findByType(tree, ['user', 'signal']);
  return nodes.map((node) => node.id);
}
