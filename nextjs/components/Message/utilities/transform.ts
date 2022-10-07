export default function transform(node: any, count = 1) {
  node.uuid = `${node.source}-${count}`;
  if (node.type === 'code') {
    if (node.value.includes('\n')) {
      node.type = 'pre';
    }
  }
  if (node.children) {
    node.children = node.children.map((node: any) =>
      transform(node, count + 1)
    );
  }
  return node;
}
