import { Element, Text2, Field } from './slackMessageEventInterface';

export interface Block {
  type: string;
  block_id: string;
  elements: Element[];
  text: Text2;
  fields: Field[];
}
