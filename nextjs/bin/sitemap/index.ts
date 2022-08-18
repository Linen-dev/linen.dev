/**
 * script to check if our sitemap is ok
 * it will validate that each one has less than 50k links
 * it will validate that it doesn't timeout within 25 seconds
 * plus any 404 or server error
 *
 * to run:
 * DEBUG=linen:sitemap npm run script:sitemap -- --url=https://linen.dev/sitemap.xml
 */

import axios from 'axios';
import { assert } from 'console';
import createDebug from 'debug';
import { stringToJs } from 'jxon';
import to from 'await-to-js';
import { findArgAndParseOrThrow } from 'utilities/processArgs';
const debug = createDebug('linen:sitemap');

interface SitemapXml {
  sitemapindex?: {
    sitemap?:
      | {
          loc: string;
        }[]
      | { loc: string };
  };
  urlset?: {
    url?:
      | {
          loc: string;
        }[]
      | { loc: string };
  };
}

const errors: string[] = [];

async function validateSitemap(url: string) {
  const [err, result] = await to(axios.get(url, { timeout: 25000 }));
  if (err) {
    errors.push('broken link ' + url);
    return;
  }
  assert(result.status === 200);

  const data = stringToJs(result.data) as SitemapXml;

  if (data.sitemapindex) {
    if (Array.isArray(data.sitemapindex.sitemap)) {
      if (!data.sitemapindex.sitemap || !data.sitemapindex.sitemap.length) {
        errors.push('empty sitemap ' + url);
        return;
      }
      if (data.sitemapindex.sitemap.length >= 50000) {
        errors.push('sitemap too big ' + url);
      }
      for (const sitemap of data.sitemapindex.sitemap.sort((a, b) =>
        a.loc.localeCompare(b.loc)
      )) {
        debug('sitemap', sitemap.loc);
        await validateSitemap(sitemap.loc);
      }
    } else {
      if (!data.sitemapindex.sitemap || !data.sitemapindex.sitemap.loc) {
        errors.push('empty sitemap ' + url);
        return;
      }
      debug('sitemap', data.sitemapindex.sitemap.loc);
      await validateSitemap(data.sitemapindex.sitemap.loc);
    }
  }
  if (data.urlset) {
    if (Array.isArray(data.urlset.url)) {
      if (!data.urlset.url || !data.urlset.url.length) {
        errors.push('empty sitemap ' + url);
        return;
      }
      if (data.urlset.url.length >= 50000) {
        errors.push('sitemap too big ' + url);
      }
      for (const site of data.urlset.url) {
        debug('site', site.loc);
      }
    } else {
      if (!data.urlset.url || !data.urlset.url.loc) {
        errors.push('empty sitemap ' + url);
        return;
      }
      debug('site', data.urlset.url.loc);
    }
  }
}

(async () => {
  const url = findArgAndParseOrThrow('url');

  validateSitemap(url)
    .then((_) => {
      console.error('failures', errors);
      debug('finished');

      const used: any = process.memoryUsage();
      console.log('process stats:');
      for (let key in used) {
        console.log(
          `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
        );
      }
    })
    .catch((e) => console.error('[ERROR]', e));
})();
