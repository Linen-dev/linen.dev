import { isImage } from '@linen/utilities/files';
import { MessageFormat, SerializedMessage } from '@linen/types';
import unique from 'lodash.uniq';
import { find, parse } from '@linen/ast';

const parsers = {
  [MessageFormat.LINEN]: parse.linen,
  [MessageFormat.SLACK]: parse.slack,
  [MessageFormat.DISCORD]: parse.discord,
  [MessageFormat.MATRIX]: parse.linen,
};

export function getImageUrls(message: SerializedMessage) {
  const parser = parsers[message.messageFormat];
  const tree = parser(message.body);
  const urls = find.urls(tree);
  return unique(
    [
      ...urls,
      ...message.attachments.map((attachment) => attachment.url),
    ].filter(isImage)
  );
}
