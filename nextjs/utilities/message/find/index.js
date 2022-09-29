import walk from '../walk';

function findByType(tree, selector) {
  const nodes = [];
  walk(tree, (node) => {
    if (node.type === selector) {
      nodes.push(node);
    }
  });
  return nodes;
}

export function findUserIds(tree) {
  const nodes = findByType(tree, 'user');
  return nodes.map((node) => node.id);
}
