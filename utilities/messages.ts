import { messages } from '@prisma/client';
import {
  START_TAG,
  END_TAG,
  HORIZONTAL_RULE_TAG,
} from '../components/Message/utilities/lexer';

const HORIZONTAL_RULE = `${START_TAG}${HORIZONTAL_RULE_TAG}hr${END_TAG}`;

type Order = 'asc' | 'desc';

export function mergeMessagesByUserId(
  messages?: messages[],
  order: Order = 'asc'
): any[] {
  if (!messages || messages.length === 0) {
    return [];
  }
  const input = order === 'asc' ? messages : messages.reverse();
  const output = input.reduce((result: messages[], message: messages) => {
    const last = result[result.length - 1];
    if (last && last.usersId && last.usersId === message.usersId) {
      last.body += `${HORIZONTAL_RULE}${message.body}`;
    } else {
      result.push(message);
    }
    return result;
  }, []);
  return order === 'asc' ? output : output.reverse();
}
