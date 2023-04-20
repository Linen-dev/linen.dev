import { build } from './build';

(async () => {
  await build((...args) => Promise.resolve(args));
})();
