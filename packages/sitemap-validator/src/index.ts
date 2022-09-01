#!/usr/bin/env node

/**
 * script to check if our sitemap is ok
 * it will validate that each one has less than 50k links
 * it will validate that it doesn't timeout within 25 seconds
 * plus any 404 or server error
 *
 * to run:
 * DEBUG=linen:sitemap npm run script:sitemap -- --url=https://linen.dev/sitemap.xml
 */

import args from 'args';
import createDebug from 'debug';
import { validateSitemap } from './validateSitemap';

export const debug = createDebug('linen:sitemap');
export const errors: string[] = [];

args.option('url', 'url to check the sitemap');
const flags = args.parse(process.argv);

const run = async () => {
  validateSitemap(flags.url)
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
};

run();
