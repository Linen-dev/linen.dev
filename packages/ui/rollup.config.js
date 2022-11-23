const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const postcss = require('rollup-plugin-postcss');
const external = require('rollup-plugin-peer-deps-external');

module.exports = {
  input: 'src/index.tsx',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    resolve(),
    postcss({
      extract: true,
      modules: true,
      use: ['sass'],
    }),
    typescript({ tsconfig: './tsconfig.json' }),
    commonjs(),
    external(),
  ],
};
