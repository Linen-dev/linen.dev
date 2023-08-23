export interface TextNode {
  type: string;
  value: string;
  source: string;
}

export interface UserNode {
  type: string;
  id: string;
  label?: string;
  source: string;
}

export interface CommandNode {
  type: string;
  name: string;
  arguments: string[];
  label?: string;
  source: string;
}

export interface ChannelNode {
  type: string;
  id: string;
  label?: string;
  source: string;
  value: string;
}

export interface LinkNode {
  type: string;
  url: string;
  title: string;
  value: string;
  source: string;
}

export interface BoldNode {
  type: string;
  children: Node[];
  source: string;
}

export interface ItalicNode {
  type: string;
  children: Node[];
  source: string;
}

export interface StrikeNode {
  type: string;
  children: Node[];
  source: string;
}

export interface UnderlineNode {
  type: string;
  children: Node[];
  source: string;
}

export interface SpoilerNode {
  type: string;
  children: Node[];
  source: string;
}

export interface QuoteNode {
  type: string;
  children: Node[];
  source: string;
}

export interface CodeNode {
  type: string;
  value: string;
  source: string;
}

export interface PreNode {
  type: string;
  value: string;
  source: string;
  language?: string;
}

export interface HeaderNode {
  type: string;
  depth: number;
  children: Node[];
  source: string;
}

export interface EmojiNode {
  type: string;
  name: string;
  variation?: string;
  source: string;
}

export type Node =
  | TextNode
  | LinkNode
  | UserNode
  | ChannelNode
  | BoldNode
  | ItalicNode
  | UnderlineNode
  | QuoteNode
  | CodeNode
  | PreNode
  | EmojiNode;

export interface RootNode {
  type: string;
  children: Node[];
  source: string;
}
