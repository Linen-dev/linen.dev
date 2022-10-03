import { SerializedThread } from 'serializers/thread';
import { SerializedMessage } from 'serializers/message';
import { SerializedUser } from 'serializers/user';
import styles from './index.module.css';
import parseLinenMessage from 'utilities/message/parsers/linen';
import parseSlackMessage from 'utilities/message/parsers/slack';
import parseDiscordMessage from 'utilities/message/parsers/discord';
import walk from 'utilities/message/walk';
import { truncate } from 'utilities/string';

interface Props {
  thread: SerializedThread;
}

const parsers = {
  linen: parseLinenMessage,
  slack: parseSlackMessage,
  discord: parseDiscordMessage,
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
  const parse = parsers.linen; // TODO parsers[message.format]
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
  });

  if (!title) {
    return 'Thread';
  }

  return truncate(title, 280);
}

export default function Title({ thread }: Props) {
  const { title } = thread;
  const message = thread.messages[0];
  return <div className={styles.title}>{title || getTitle(message)}</div>;
}
