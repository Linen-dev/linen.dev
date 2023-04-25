import { load } from 'cheerio';
import axios from 'axios';
import { findAccountsPremium } from 'services/accounts';
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
  return Number(getResult(resultStats) || 0);
}

export async function crawlGoogleResults() {
  const accounts = await findAccountsPremium();

  const result = await Promise.all(
    [...accounts, { redirectDomain: 'linen.dev' }].map(
      async ({ redirectDomain }) => {
        const stats = await query(redirectDomain!);
        return { redirectDomain, stats };
      }
    )
  );
  const message = result
    .sort((a, b) => b?.stats - a?.stats)
    .map((acc) => acc.redirectDomain!.padEnd(50, '.') + acc.stats);

  console.log('message', message);

  await sendNotification(message.join('\n'));
}
