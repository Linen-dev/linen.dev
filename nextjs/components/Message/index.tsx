import React from 'react';
import { users } from '@prisma/client';
import Text from './Text';
import Mention from './Mention';
import Link from './Link';
import Channel from './Channel';
import InlineCode from './InlineCode';
import BlockCode from './BlockCode';
import Emoji from './Emoji';
import Quote from './Quote';
import Reactions from './Reactions';
import Attachments from './Attachments';
import transform from './utilities/transform';
import styles from './index.module.css';
import { SerializedReaction, SerializedAttachment } from 'types/shared';
import parseLinenMessage from 'utilities/message/parsers/linen';
import parseSlackMessage from 'utilities/message/parsers/slack';
import parseDiscordMessage from 'utilities/message/parsers/discord';
import {
  Node,
  RootNode,
  BoldNode,
  TextNode,
  UserNode,
  StrikeNode,
  ChannelNode,
  LinkNode,
  ItalicNode,
  QuoteNode,
  CodeNode,
  PreNode,
  EmojiNode,
} from 'utilities/message/parsers/types';

interface Props {
  text: string;
  format?: 'linen' | 'discord' | 'slack';
  truncate?: any;
  mentions?: users[];
  reactions?: SerializedReaction[];
  attachments?: SerializedAttachment[];
}

const parsers = {
  linen: parseLinenMessage,
  slack: parseSlackMessage,
  discord: parseDiscordMessage,
};

const DEFAULT_FORMAT = 'slack';

function noAttachment(attachments?: SerializedAttachment[]) {
  return !attachments || attachments?.length === 0;
}

function Message({ text, format, mentions, reactions, attachments }: Props) {
  if (text === '' && noAttachment(attachments)) {
    text = 'message has been deleted';
  }
  const parse = parsers[format || DEFAULT_FORMAT];
  const tree = transform(parse(text));

  function render(node: RootNode | Node): React.ReactNode {
    switch (node.type) {
      case 'root':
        return (node as RootNode).children.map(render);
      case 'bold':
        return (
          <strong key={node.source}>
            {(node as BoldNode).children.map(render)}
          </strong>
        );
      case 'italic':
        return (
          <em className="italic" key={node.source}>
            {(node as ItalicNode).children.map(render)}
          </em>
        );
      case 'strike':
        return (
          <del key={node.source}>
            {(node as StrikeNode).children.map(render)}
          </del>
        );
      case 'quote':
        return (
          <Quote key={node.source}>
            {(node as QuoteNode).children.map(render)}
          </Quote>
        );
      case 'text':
        return (
          <Text
            key={node.source}
            format={format}
            value={(node as TextNode).value}
          />
        );
      case 'user':
        return (
          <Mention
            key={node.source}
            value={(node as UserNode).id}
            mentions={mentions}
          />
        );
      case 'channel':
        return (
          <Channel key={node.source} value={(node as ChannelNode).value} />
        );
      case 'code':
        return (
          <InlineCode key={node.source} value={(node as CodeNode).value} />
        );
      case 'pre':
        return <BlockCode key={node.source} value={(node as PreNode).value} />;
      case 'url':
        return <Link key={node.source} value={(node as LinkNode).value} />;
      case 'emoji':
        return <Emoji key={node.source} text={(node as EmojiNode).source} />;
    }
    return <React.Fragment key={node.source}>{node.source}</React.Fragment>;
  }

  return (
    <div className={styles.message}>
      {render(tree)}
      <Attachments attachments={attachments} />
      <Reactions reactions={reactions} />
    </div>
  );
}

Message.defaultProps = {
  format: DEFAULT_FORMAT,
};

export default Message;
