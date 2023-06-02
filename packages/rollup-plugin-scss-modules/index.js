const { createFilter } = require('rollup-pluginutils');
const sass = require('sass');
const postcss = require('postcss');
const modules = require('postcss-modules');

async function compile(scss) {
  const result = sass.compileString(scss);
  let classes = {};
  const processor = await postcss([
    modules({
      generateScopedName: '[local]___[hash:base64:5]',
      getJSON(_, styles) {
        classes = styles;
      },
    }),
  ]);
  const output = await processor.process(result.css, { from: undefined });
  const { css } = output;
  return { css, classes };
}

module.exports = function scss(options = {}) {
  const filter = createFilter(
    options.include || ['/**/*.scss'],
    options.exclude
  );
  const fileName = options.fileName || 'index.css';
  const name = options.name || 'index.css';
  const styles = {};

  return {
    name: 'scss',
    async transform(code, id) {
      if (!filter(id)) {
        return;
      }

      if (Array.isArray(options.watch)) {
        options.watch.forEach((file) => this.addWatchFile(file));
      }

      const { css, classes } = await compile(code);

      styles[id] = css;

      return `export default ${JSON.stringify(classes)}`;
    },
    async generateBundle() {
      let css = '';
      for (const id in styles) {
        css += `${styles[id]}\n` || '';
      }

      this.emitFile({
        type: 'asset',
        source: css,
        name,
        fileName,
      });
    },
  };
};
