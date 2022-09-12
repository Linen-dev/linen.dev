import { crawlGoogleResults } from 'services/crawler';
import { anonymizeUsers } from '../../services/anonymize';
import { slugify } from '../../services/slugify';
import { updateMessagesCount } from './thread-message-count';

(async () => {
  await crawlGoogleResults();
  await anonymizeUsers();
  await slugify();
  await updateMessagesCount();
})();
