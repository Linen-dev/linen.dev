import { isImage } from '@linen/utilities/files';
import { MessageFormat, SerializedThread } from '@linen/types';
import unique from 'lodash.uniq';
import { find, parse } from '@linen/ast';

const parsers = {
  [MessageFormat.LINEN]: parse.linen,
  [MessageFormat.SLACK]: parse.slack,
  [MessageFormat.DISCORD]: parse.discord,
  [MessageFormat.MATRIX]: parse.linen,
};

export function getImageUrls(threads: SerializedThread[]): string[] {
  const array = threads.map((thread) => {
    const { messages } = thread;
    return messages
      .map((message) => {
        const parser = parsers[message.messageFormat];
        const tree = parser(message.body);
        const urls = find.urls(tree);
        return [
          ...urls,
          ...message.attachments.map((attachment) => attachment.url),
        ].filter(isImage);
      })
      .flat();
  });

  return unique(array.flat());
}
