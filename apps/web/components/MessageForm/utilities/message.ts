import { parse, stringify, walk } from '@linen/ast';
import { SerializedUser } from '@linen/types';

function getTag(type: string) {
  switch (type) {
    case 'user':
      return '@';
    case 'signal':
      return '!';
  }
  return '';
}

export const postprocess = (
  message: string,
  allUsers: SerializedUser[]
): string => {
  const tree = parse.linen(message);
  walk(tree, (node: any) => {
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

const IGNORED_TYPES = ['root', 'text'];

export const previewable = (message: string): boolean => {
  let boolean = false;
  const tree = parse.linen(message);
  walk(tree, (node: any) => {
    if (!IGNORED_TYPES.includes(node.type)) {
      boolean = true;
    }
  });
  return boolean;
};
