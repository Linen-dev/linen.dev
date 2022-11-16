import { crawlGoogleResults } from 'services/crawler';
import { anonymizeUsers } from '../../services/anonymize';
import { slugify } from '../../services/slugify';
import { updateMessagesCount } from './thread-message-count';

const shouldWeCrawl = () => {
  const weekDay = new Date().getDay(); // monday=1
  if (weekDay === 2) return true; // tuesday
  if (weekDay === 5) return true; // friday
  return false;
};

(async () => {
  if (shouldWeCrawl()) {
    await crawlGoogleResults();
  }
  await anonymizeUsers();
  await slugify();
  await updateMessagesCount();
})();
