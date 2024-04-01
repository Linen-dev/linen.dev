import React from 'react';
import { SerializedMessage, SerializedThread } from '@linen/types';
import { parse, walk } from '@linen/ast';
import { truncate } from '@linen/utilities/string';
import { MessageFormat } from '@linen/types';
import styles from './index.module.scss';
import { getDisplayName } from '@linen/utilities/getDisplayName';

interface Props {
  thread: SerializedThread;
}

const parsers = {
  [MessageFormat.LINEN]: parse.linen,
  [MessageFormat.SLACK]: parse.slack,
  [MessageFormat.DISCORD]: parse.discord,
  [MessageFormat.MATRIX]: parse.linen,
};

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
