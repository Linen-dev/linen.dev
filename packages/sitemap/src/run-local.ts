import { rimraf } from 'rimraf';
import { build } from './build';

(async () => {
  process.env.RUN_LOCAL = 'true';
  await rimraf('./sitemap');
  await build((...args) => Promise.resolve(args), console as any);
})();
