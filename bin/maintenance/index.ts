import { anonymizeUsers } from '../../services/anonymize';
import { slugify } from '../../services/slugify';
import { updateMessagesCount } from './thread-message-count';

(async () => {
  await anonymizeUsers();
  await slugify();
  await updateMessagesCount();
})();
