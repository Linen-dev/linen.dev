import React from 'react';
import Text from './Text';
import Mention from './Mention';
import Link from './Link';
import Channel from './Channel';
import InlineCode from './InlineCode';
import BlockCode from './BlockCode';
import Emoji from './Emoji';
import Quote from './Quote';
import Header from './Header';
import Reactions from './Reactions';
import Attachments from './Attachments';
import transform from './utilities/transform';
import styles from './index.module.scss';
import { SerializedAttachment } from 'types/shared';
import { SerializedReaction } from 'serializers/reaction';
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
  HeaderNode,
} from 'utilities/message/parsers/types';
import { SerializedUser } from 'serializers/user';
import { MessageFormat } from '@prisma/client';

interface Props {
  text: string;
  format: MessageFormat;
  truncate?: any;
  mentions?: SerializedUser[];
  reactions?: SerializedReaction[];
  attachments?: SerializedAttachment[];
  currentUser?: SerializedUser | null;
}

const parsers = {
  [MessageFormat.LINEN]: parseLinenMessage,
  [MessageFormat.SLACK]: parseSlackMessage,
  [MessageFormat.DISCORD]: parseDiscordMessage,
};

function noAttachment(attachments?: SerializedAttachment[]) {
  return !attachments || attachments?.length === 0;
}

function Message({
  text,
  format,
  mentions,
  reactions,
  attachments,
  currentUser,
}: Props) {
  if (text === '' && noAttachment(attachments)) {
    text = 'message has been deleted';
  }
  const parse = parsers[format];
  const input = text.trim();
  const tree = transform(parse(input));

  function render(node: any): React.ReactNode {
    switch (node.type) {
      case 'root':
        return (node as RootNode).children.map(render);
      case 'bold':
        return (
          <strong key={node.cid}>
            {(node as BoldNode).children.map(render)}
          </strong>
        );
      case 'italic':
        return (
          <em className="italic" key={node.cid}>
            {(node as ItalicNode).children.map(render)}
          </em>
        );
      case 'strike':
        return (
          <del key={node.cid}>{(node as StrikeNode).children.map(render)}</del>
        );
      case 'quote':
        return (
          <Quote key={node.cid}>
            {(node as QuoteNode).children.map(render)}
          </Quote>
        );
      case 'header':
        return (
          <Header depth={node.depth} key={node.cid}>
            {(node as HeaderNode).children.map(render)}
          </Header>
        );
      case 'text':
        return (
          <Text
            key={node.cid}
            format={format}
            value={(node as TextNode).value}
          />
        );
      case 'user':
        return (
          <Mention
            tag="@"
            key={node.cid}
            value={(node as UserNode).id}
            mentions={mentions}
          />
        );
      case 'signal':
        return (
          <Mention
            tag="!"
            key={node.cid}
            value={(node as UserNode).id}
            mentions={mentions}
          />
        );
      case 'channel':
        return <Channel key={node.cid} value={(node as ChannelNode).value} />;
      case 'code':
        return <InlineCode key={node.cid} value={(node as CodeNode).value} />;
      case 'pre':
        return <BlockCode key={node.cid} value={(node as PreNode).value} />;
      case 'url':
        return <Link key={node.cid} value={(node as LinkNode).value} />;
      case 'emoji':
        return <Emoji key={node.cid} text={(node as EmojiNode).source} />;
    }
    return <React.Fragment key={node.cid}>{node.source}</React.Fragment>;
  }

  return (
    <div className={styles.message}>
      {render(tree)}
      <Attachments attachments={attachments} />
      <Reactions reactions={reactions} currentUser={currentUser} />
    </div>
  );
}

export default Message;
