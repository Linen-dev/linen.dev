import { anonymizeUsers } from '../../services/anonymize';
import { slugify } from '../../services/slugify';
import { sanitizeThreads } from './slack-thread-sanitizer';
import { updateMessagesCount } from './thread-message-count';

(async () => {
  await anonymizeUsers();
  await slugify();
  await updateMessagesCount();
  await sanitizeThreads();
})();
