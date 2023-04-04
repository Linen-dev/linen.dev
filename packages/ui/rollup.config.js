const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const postcss = require('rollup-plugin-postcss');
const external = require('rollup-plugin-peer-deps-external');
const { visualizer } = require('rollup-plugin-visualizer');

module.exports = {
  input: 'src/index.tsx',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [
    resolve(),
    postcss({
      extract: true,
      modules: true,
      use: ['sass'],
    }),
    typescript({
      compilerOptions: {
        target: 'esnext',
        module: 'esnext',
        strict: true,
        esModuleInterop: true,
        jsx: 'react',
      },
    }),
    commonjs(),
    external(),
    process.env.ANALYZE && visualizer(),
  ].filter(Boolean),
};
