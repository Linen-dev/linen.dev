export default function transform(tree: any) {
  if (tree.type === 'code') {
    if (tree.value.includes('\n')) {
      tree.type = 'pre';
    }
  }
  if (tree.children) {
    tree.children = tree.children.map(transform);
  }
  return tree;
}
