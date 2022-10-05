import { v4 as uuid } from 'uuid';

export default function transform(node: any) {
  node.uuid = uuid();
  if (node.type === 'code') {
    if (node.value.includes('\n')) {
      node.type = 'pre';
    }
  }
  if (node.children) {
    node.children = node.children.map(transform);
  }
  return node;
}
