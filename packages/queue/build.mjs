import * as esbuild from 'esbuild';
import { rimraf } from 'rimraf';

await rimraf('dist');

await esbuild.build({
  entryPoints: ['src/index.ts', 'src/discord-bot.ts', 'src/pagination.ts'],
  bundle: true,
  outdir: 'dist',
  platform: 'node',
  target: 'node18',
  external: ['graphile-worker', '@linen/database'],
  logLevel: 'info',
  minify: true,
});
