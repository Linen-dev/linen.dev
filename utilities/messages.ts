import { messages } from '@prisma/client';

export function mergeMessagesByUserId(messages?: messages[]): messages[] {
  if (!messages) {
    return [];
  }
  return messages.reduce((result: messages[], message: messages) => {
    const last = result[result.length - 1];
    if (last && last.usersId && last.usersId === message.usersId) {
      last.body += `\n${message.body}`;
    } else {
      result.push(message);
    }
    return result;
  }, []);
}
