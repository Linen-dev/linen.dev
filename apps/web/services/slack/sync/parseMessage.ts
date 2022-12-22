import { SlackAppIds } from 'secrets';
import type { SlackMessageEvent } from 'types/slackResponses/slackMessageEventInterface';
import type { ConversationHistoryMessage } from '../api';

export function parseMessage<
  T extends SlackMessageEvent | ConversationHistoryMessage
>(message: T) {
  // if text field has message, we don't need to parse
  if (!!message.text) {
    return message;
  }
  if (message.attachments) {
    message.text = message.attachments.reduce((prev, curr) => {
      const text = [curr.title, curr.pretext, curr.text, curr.footer]
        .filter(Boolean)
        .join('\n');
      return [prev, !!text ? text : curr.fallback].filter(Boolean).join('\n');
    }, '');
    return message;
  }
  return message;
}

export function filterMessages<
  T extends SlackMessageEvent | ConversationHistoryMessage
>(message: T) {
  if (message.subtype) {
    return message.subtype === 'bot_message' && isNotLinenBot(message);
  }
  return true;
}

function isNotLinenBot<
  T extends SlackMessageEvent | ConversationHistoryMessage
>(message: T) {
  if (!message.app_id) return true;
  if (!SlackAppIds.includes(message.app_id)) return true;
  return false;
}
