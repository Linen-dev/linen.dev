import axios from 'axios';
import { assert } from 'console';
import jxon from 'jxon';
import to from 'await-to-js';
import { errors, debug } from './index';
import { SitemapXml } from './SitemapXml';

export async function validateSitemap(url: string) {
  const [err, result] = await to(axios.get(url, { timeout: 25000 }));
  if (err) {
    errors.push('broken link ' + url);
    return;
  }
  assert(result.status === 200);

  const data = jxon.stringToJs(result.data) as SitemapXml;

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
