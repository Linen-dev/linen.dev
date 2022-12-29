# Bundle React UI library with SCSS, CSS Modules, Typescript and Rollup

CSS Modules can be very useful for managing styles in large codebases. They're sometimes used together with `sass`, which can help you split or abstract css even further. Here's how it'd would look like for a simple `Card` component.

```
/* Card.tsx */

import React from 'react'
import styles from './index.module.scss'

interface Props {
  children: React.ReactNode;
}

export default function Card ({ children }: Props) {
  return <div className={styles.card}>{children}</div>
}
```

## Setup

The UI library is going to have two main output files, `dist/index.js` and `dist/index.css`. You'll need to include the css file manually inside of your app. Configuration wise, we'll need to setup a build process that creates a bundle for us. Here's an example rollup configuration file.

```
/* rollup.config.js */

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
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    external(),
  ],
};
```

It's using few dependencies:

```
npm install --save-dev rollup
npm install --save-dev @rollup/plugin-node-resolve
npm install --save-dev @rollup/plugin-commonjs
npm install --save-dev @rollup/plugin-typescript
npm install --save-dev rollup-plugin-postcss
npm install --save-dev rollup-plugin-peer-deps-external
npm install --save-dev sass
```

You should also install react.

```
npm install react
```

At this point, running `npx rollup --config rollup.config.js` would create a bundle that includes react. We shouldn't include `react` there, e.g. because if would significantly increase your app size if you're using a different react version or cause other unintended side effects. The solution for this is to move `react` to `peerDependencies` inside of `package.json`. `npm` does not offer a shortcut for installing peer dependencies yet (2022), so you need to do it manually.

## Examples

You can find a real life example here in our repo. It also contains a basic `jest` test setup. https://github.com/Linen-dev/linen.dev/tree/main/packages/uiI hope this short article helps even a little :). In case of any questions, just ask them in the thread.
