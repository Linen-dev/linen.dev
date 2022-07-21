import React from 'react';
import { users } from '@prisma/client';
import Text from './Text';
import Mention from './Mention';
import Link from './Link';
import Mail from './Mail';
import BasicChannel from './BasicChannel';
import ComplexChannel from './ComplexChannel';
import InlineCode from './InlineCode';
import BlockCode from './BlockCode';
import HorizontalRule from './HorizontalRule';
import Reactions from './Reactions';
import Attachments from './Attachments';
import { tokenize, TokenType } from './utilities/lexer';
import { truncate as truncateText } from './utilities/string';
import styles from './index.module.css';
import { SerializedReaction, SerializedAttachment } from 'types/shared';

interface Props {
  text: string;
  truncate?: any;
  mentions?: users[];
  reactions?: SerializedReaction[];
  attachments?: SerializedAttachment[];
}

function Message({ text, truncate, mentions, reactions, attachments }: Props) {
  if (text === '') {
    text = 'message has been deleted';
  }
  const input = truncate ? truncateText(text) : text;
  const tokens = tokenize(input);

  return (
    <div className={styles.message}>
      {tokens
        .filter((token) => !!token.value)
        .map((token, index) => {
          const { type, value } = token;
          const key = `${index}-${type}-${value}`;
          switch (type) {
            case TokenType.Text:
              return <Text key={key} value={value} />;
            case TokenType.Mention:
              return <Mention key={key} value={value} mentions={mentions} />;
            case TokenType.Link:
              return <Link key={key} value={value} />;
            case TokenType.Mail:
              return <Mail key={key} value={value} />;
            case TokenType.InlineCode:
              return <InlineCode key={key} value={value} />;
            case TokenType.BlockCode:
              return <BlockCode key={key} value={value} />;
            case TokenType.BasicChannel:
              return <BasicChannel key={key} value={value} />;
            case TokenType.ComplexChannel:
              return <ComplexChannel key={key} value={value} />;
            case TokenType.HorizontalRule:
              return <HorizontalRule key={key} />;
            default:
              return null;
          }
        })
        .filter(Boolean)}
      <Attachments attachments={attachments} />

      <Reactions reactions={reactions} />
    </div>
  );
}

export default Message;
