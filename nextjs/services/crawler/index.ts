import { load } from 'cheerio';
import axios from 'axios';
import { findAccountsPremium } from 'lib/account';
import { sendNotification } from 'services/slack';

function getResult(text: string) {
  let result = text.split(/\(.+\)/).join('');
  return result.match(/\d/g)?.join('');
}

async function query(site: string) {
  const result = await axios.get(
    `https://www.google.com/search?q=site:${site}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
      },
    }
  );
  const $ = load(result.data);
  const resultStats = $('#result-stats').text();
  return getResult(resultStats);
}

export async function crawlGoogleResults() {
  const accounts = await findAccountsPremium();

  const result = await Promise.all(
    [...accounts, { redirectDomain: 'linen.dev' }].map(async (account) => {
      if (account.redirectDomain) {
        const stats = await query(account.redirectDomain);
        return account.redirectDomain.padEnd(50, '.') + (stats || '-');
      }
    })
  );
  console.log('result', result);
  await sendNotification(result.filter(Boolean).join('\n'));
}
