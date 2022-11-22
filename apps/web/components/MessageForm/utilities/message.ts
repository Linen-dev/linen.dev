import { parse, stringify, walk } from '@linen/ast';
import { SerializedUser } from 'serializers/user';

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
      }
    }
  });
  return stringify(tree);
};
