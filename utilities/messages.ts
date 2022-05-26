import { messages } from '@prisma/client';

export function mergeMessagesByUserId(messages: messages[]): messages[] {
  return messages.reduce((result: messages[], message: messages) => {
    const last = result[result.length - 1];
    if (last && last.usersId === message.usersId) {
      last.body += `\n${message.body}`;
    } else {
      result.push(message);
    }
    return result;
  }, []);
}
