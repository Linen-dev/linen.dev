import fs from 'fs/promises';
import { EOL } from 'os';
import { extname } from 'path';

const isUI = process.argv.find((a) => a.startsWith('ui'));

const files = await fs.readdir('./src', { withFileTypes: !!isUI });

const toExport = isUI
  ? files.filter((f) => f.isDirectory()).map((f) => f.name)
  : files
      .filter((f) => !f.match(/.test|spec./))
      .map((f) => f.substring(0, f.lastIndexOf(extname(f))));

const packageJson = await fs.readFile('package.json').then(JSON.parse);

packageJson.exports = toExport.reduce((prev, curr) => {
  return {
    ...prev,
    [`./${curr}`]: `./dist/${curr}${isUI ? '/index' : ''}.js`,
  };
}, {});

packageJson.typesVersions = {
  '*': toExport.reduce((prev, curr) => {
    return {
      ...prev,
      [curr]: [`./dist/${curr}${isUI ? '/index' : ''}.d.ts`],
    };
  }, {}),
};

if (isUI) {
  packageJson.exports['./index.css'] = `./dist/index.css`;
}

await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2) + EOL);
