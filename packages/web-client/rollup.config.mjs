import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import image from '@rollup/plugin-image';

export default {
  input: 'src/index.tsx',
  output: {
    dir: 'dist',
    format: 'umd',
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
    resolve(),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    image({
      dom: false,
    }),
  ],
};
