import { MessageFormat, SerializedThread, SerializedUser } from '@linen/types';
import { parse, walk } from '@linen/ast';

const parsers = {
  [MessageFormat.LINEN]: parse.linen,
  [MessageFormat.SLACK]: parse.slack,
  [MessageFormat.DISCORD]: parse.discord,
  [MessageFormat.MATRIX]: parse.linen,
};

export function getUserMentions({
  currentUser,
  thread,
}: {
  currentUser: SerializedUser | null;
  thread: SerializedThread;
}): string[] {
  if (!currentUser) {
    return [];
  }
  const userId = currentUser.id;
  const { messages } = thread;
  if (messages.length === 0) {
    return [];
  }
  let mentions: string[] = [];
  for (let i = 0, ilen = messages.length; i < ilen; i++) {
    const message = messages[i];
    const parse = parsers[message.messageFormat];
    if (parse) {
      const tree = parse(message.body);
      walk(tree, (node: any) => {
        if (node.type === 'signal' && node.id === userId) {
          mentions.push('signal');
        } else if (node.type === 'user' && node.id === userId) {
          mentions.push('user');
        }
      });
    }
  }
  return mentions;
}
