import React from 'react';
import classNames from 'classnames';
import Text from './Text';
import Mention from './Mention';
import Link from './Link';
import List from './List';
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
import {
  MessageFormat,
  SerializedAttachment,
  SerializedReaction,
  SerializedUser,
} from '@linen/types';
import { parse } from '@linen/ast';
import {
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
} from '@linen/ast/parse/types';

interface Props {
  className?: string;
  text: string;
  format: MessageFormat;
  truncate?: boolean;
  mentions?: SerializedUser[];
  reactions?: SerializedReaction[];
  attachments?: SerializedAttachment[];
  currentUser?: SerializedUser | null;
  placeholder?: boolean;
  onLinkClick?(event: React.MouseEvent<HTMLAnchorElement>): void;
  onLoad?(): void;
}

const parsers = {
  [MessageFormat.LINEN]: parse.linen,
  [MessageFormat.SLACK]: parse.slack,
  [MessageFormat.DISCORD]: parse.discord,
  [MessageFormat.MATRIX]: parse.linen,
};

function noAttachment(attachments?: SerializedAttachment[]) {
  return !attachments || attachments?.length === 0;
}

function Message({
  className,
  text,
  format,
  truncate,
  mentions,
  reactions,
  attachments,
  currentUser,
  placeholder,
  onLinkClick,
  onLoad,
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
          <em className={styles.italic} key={node.cid}>
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
        return <Text key={node.cid} value={(node as TextNode).value} />;
      case 'user':
        return (
          <Mention
            tag="@"
            key={node.cid}
            value={(node as UserNode).id}
            mentions={mentions}
          />
        );
      case 'list':
        return (
          <List key={node.cid} ordered={node.ordered}>
            {node.children.map(render)}
          </List>
        );
      case 'item':
        return <li key={node.cid}>{node.children.map(render)}</li>;
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
        return (
          <BlockCode
            key={node.cid}
            value={(node as PreNode).value}
            placeholder={placeholder}
          />
        );
      case 'url':
        return (
          <Link
            key={node.cid}
            url={(node as LinkNode).url}
            title={(node as LinkNode).title}
            onClick={onLinkClick}
            onLoad={onLoad}
          />
        );
      case 'emoji':
        return <Emoji key={node.cid} text={(node as EmojiNode).source} />;
    }
    return <React.Fragment key={node.cid}>{node.source}</React.Fragment>;
  }

  return (
    <div className={classNames(styles.message, className)}>
      <div
        className={classNames({
          [styles.truncate]: truncate,
        })}
      >
        {render(tree)}
      </div>
      <Attachments attachments={attachments} onLoad={onLoad} />
      <Reactions reactions={reactions} currentUser={currentUser} />
    </div>
  );
}

export default Message;
