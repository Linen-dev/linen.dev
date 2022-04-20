import React from 'react';
import { tokenize, TokenType } from './utilities/lexer';
import ReactEmoji from 'react-emoji-render';
import classNames from 'classnames';
import { users } from '@prisma/client';
import styles from './index.module.css';

function truncateText(text: string, truncate: boolean) {
  if (!truncate) {
    return text;
  }
  const excerpt = text.substr(0, 220);
  return `${excerpt}${excerpt.length === 220 ? '...' : ''}`;
}

function getDisplayName(userId: string, mentions?: users[]) {
  if (!mentions) {
    return 'User';
  }
  const user = mentions.find((u) => u.id === userId);
  return user?.displayName || 'User';
}

function Message({
  text,
  truncate,
  mentions,
}: {
  text: string;
  truncate?: any;
  mentions?: users[];
}) {
  const tokens = tokenize(truncateText(text, truncate));

  return (
    <div className={styles.message}>
      {tokens
        .map((token, index) => {
          const { type, value } = token;
          if (!value) {
            return null;
          }
          const key = `${index}-${type}-${value}`;
          if (type === TokenType.Text) {
            return <ReactEmoji key={key} text={value} />;
          }
          if (type === TokenType.Mention) {
            return (
              <strong key={key}>@{getDisplayName(value, mentions)}</strong>
            );
          }
          if (type === TokenType.Link) {
            const [href, name] = value.split('|');
            return (
              <a className="underline text-indigo-700" key={key} href={href}>
                {name || href}
              </a>
            );
          }
          if (type === TokenType.BasicChannel) {
            return <strong key={key}>@{value}</strong>;
          }
          if (type === TokenType.ComplexChannel) {
            const [id, name] = value.split('|');
            return <strong key={key}>#{name || id}</strong>;
          }
          if (type === TokenType.InlineCode) {
            return (
              <code key={key} className={styles.code}>
                {value}
              </code>
            );
          }
          if (type === TokenType.BlockCode) {
            return (
              <code key={key} className={classNames(styles.code, 'block')}>
                {value}
              </code>
            );
          }
          return null;
        })
        .filter(Boolean)}
    </div>
  );
}

export default Message;
