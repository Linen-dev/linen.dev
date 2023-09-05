import { JsonValue } from './utils/json';

export type messageReactions = {
  messagesId: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  count: number | null;
  users: JsonValue | null;
};
