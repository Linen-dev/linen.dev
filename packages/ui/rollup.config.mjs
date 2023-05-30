import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss-modules';
import external from 'rollup-plugin-peer-deps-external';
import { visualizer } from 'rollup-plugin-visualizer';
import glob from 'glob';
import { fileURLToPath } from 'node:url';

const search = fileURLToPath(new URL('src/**/*.tsx', import.meta.url));

const input = glob
  .sync(search)
  .filter((file) => !file.includes('.test.') && !file.includes('.spec.'));

export default {
  input,
  output: {
    dir: 'dist',
    format: 'cjs',
    entryFileNames(chunk) {
      const file = chunk.facadeModuleId
        .replace(fileURLToPath(new URL('src/', import.meta.url)), '')
        .replace('index.tsx', '[name].js');
      return file;
    },
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
    resolve(),
    postcss({
      extract: true,
      modules: true,
      use: ['sass'],
    }),
    commonjs(),
    external(),
    process.env.ANALYZE && visualizer(),
  ].filter(Boolean),
};
