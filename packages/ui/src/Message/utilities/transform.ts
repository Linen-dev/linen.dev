export default function transform(node: any, count = 1) {
  count += 1;
  node.cid = `${node.source || node.id}-${count}`;
  if (node.type === 'code') {
    if (node.value.includes('\n')) {
      node.type = 'pre';
    }
  }
  if (node.type === 'text') {
    const value = node.value.trim();
    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        JSON.parse(value);
        node.type = 'pre';
      } catch (exception) {}
    }
  }
  if (node.children) {
    node.children = node.children.map((node: any, index: number) =>
      transform(node, count + index)
    );
  }
  return node;
}
