import { SerializedThread } from 'serializers/thread';
import { SerializedMessage } from 'serializers/message';
import { SerializedUser } from 'serializers/user';
import styles from './index.module.css';
import { parse, walk } from '@linen/ast';
import { truncate } from 'utilities/string';
import { MessageFormat } from '@prisma/client';

interface Props {
  thread: SerializedThread;
}

const parsers = {
  [MessageFormat.LINEN]: parse.linen,
  [MessageFormat.SLACK]: parse.slack,
  [MessageFormat.DISCORD]: parse.discord,
};

function getDisplayName(userId: string, mentions?: SerializedUser[]) {
  if (!mentions) {
    return 'User';
  }
  const user = mentions.find(
    (user) => user.id === userId || user.externalUserId === userId
  );
  return user?.displayName || 'User';
}

function getTitle(message: SerializedMessage): string {
  const parse = parsers[message.messageFormat];
  const tree = parse(message.body);
  let title = '';

  walk(tree, (node: any) => {
    if (node.type === 'root') return;
    if (node.type === 'text') {
      title += node.value;
    }
    if (node.type === 'code') {
      title += node.value;
    }
    if (node.type === 'pre') {
      title += node.value;
    }
    if (node.type === 'url') {
      title += node.url;
    }
    if (node.type === 'user') {
      title += `@${getDisplayName(node.id, message.mentions)}`;
    }
    if (node.type === 'signal') {
      title += `!${getDisplayName(node.id, message.mentions)}`;
    }
  });

  if (!title) {
    return 'Thread';
  }

  return truncate(title, 280);
}

export default function Title({ thread }: Props) {
  const { title } = thread;
  const message = thread.messages[thread.messages.length - 1];
  return <div className={styles.title}>{title || getTitle(message)}</div>;
}
