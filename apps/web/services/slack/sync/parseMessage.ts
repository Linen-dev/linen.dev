import { SlackAppIds } from 'config';
import type {
  SlackMessageEvent,
  ConversationHistoryMessage,
} from '@linen/types';

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
  if (!message.text && message.files?.length) {
    message.text = message.files
      .map((f) => f.name)
      .filter(Boolean)
      .join();
  }
  return message;
}

export function filterMessages<
  T extends SlackMessageEvent | ConversationHistoryMessage
>(message: T) {
  if (message.subtype && message.subtype === 'channel_join') {
    return false;
  }
  if (message.subtype && message.subtype === 'bot_message') {
    return isNotLinenBot(message);
  }
  if (!!message.app_id && !!message.message?.app_id) {
    return isNotLinenBot(message);
  }
  if (
    message.subtype &&
    message.subtype === 'message_changed' &&
    message.message &&
    !!message.message.app_id
  ) {
    return isNotLinenBot(message);
  }
  return true;
}

function isNotLinenBot<
  T extends SlackMessageEvent | ConversationHistoryMessage
>(message: T) {
  if (message.message) {
    if (!message.message.app_id) return true;
    if (!SlackAppIds.includes(message.message.app_id)) return true;
  } else {
    if (!message.app_id) return true;
    if (!SlackAppIds.includes(message.app_id)) return true;
  }
  return false;
}
