import { SerializedThread } from 'serializers/thread';
import { SerializedMessage } from 'serializers/message';
import { SerializedUser } from 'serializers/user';
import styles from './index.module.scss';
import parseLinenMessage from 'utilities/message/parsers/linen';
import parseSlackMessage from 'utilities/message/parsers/slack';
import parseDiscordMessage from 'utilities/message/parsers/discord';
import walk from 'utilities/message/walk';
import { MessageFormat } from '@prisma/client';

interface Props {
  thread: SerializedThread;
  onClick(): void;
}

const parsers = {
  [MessageFormat.LINEN]: parseLinenMessage,
  [MessageFormat.SLACK]: parseSlackMessage,
  [MessageFormat.DISCORD]: parseDiscordMessage,
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

function getContent(message: SerializedMessage): string {
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

  return title;
}

export default function PinnedThread({ thread, onClick }: Props) {
  const message = thread.messages[0];
  return (
    <div className={styles.title} onClick={onClick}>
      {getContent(message)}
    </div>
  );
}
