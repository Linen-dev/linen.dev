import fs from 'fs/promises';
import { extname } from 'path';

const files = await fs.readdir('./src');
const toExport = files
  .filter((f) => !f.match(/.test|spec./))
  .map((f) => f.substring(0, f.lastIndexOf(extname(f))));

const packageJson = await fs.readFile('package.json').then(JSON.parse);

packageJson.exports = toExport.reduce((prev, curr) => {
  return { ...prev, [`./${curr}`]: `./dist/${curr}.js` };
}, {});

packageJson.typesVersions = {
  '*': toExport.reduce((prev, curr) => {
    return { ...prev, [curr]: [`./dist/${curr}.d.ts`] };
  }, {}),
};

await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
