import { isImage } from '@/Message/Link/utilities';
import { MessageFormat, SerializedThread } from '@linen/types';
import unique from 'lodash.uniq';
import { find, parse } from '@linen/ast';

const parsers = {
  [MessageFormat.LINEN]: parse.linen,
  [MessageFormat.SLACK]: parse.slack,
  [MessageFormat.DISCORD]: parse.discord,
  [MessageFormat.MATRIX]: parse.linen,
};

export function getImageUrls(thread: SerializedThread) {
  const { messages } = thread;

  const array = messages.map((message) => {
    const parser = parsers[message.messageFormat];
    const tree = parser(message.body);
    const urls = find.urls(tree);
    return [
      ...urls,
      ...message.attachments.map((attachment) => attachment.url),
    ].filter(isImage);
  });

  return unique(array.flat());
}
