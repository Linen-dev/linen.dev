import fs from 'fs';
import StringUtils from '../../utils/string';
import { isFileValid } from './utilities/filter';

class FileStore {
  static async write({ dir, files }) {
    fs.mkdirSync(dir, { recursive: true });
    for (const file of files) {
      if (isFileValid(file)) {
        const filename = StringUtils.clean(file.metadata.source);
        fs.writeFileSync(`${dir}/${filename}.json`, JSON.stringify(file));
      }
    }
  }

  static async read({ dir }) {
    const files = fs.readdirSync(dir);
    return files.map((path) => {
      const content = fs.readFileSync(`${dir}/${path}`, {
        encoding: 'utf-8',
      });
      return {
        path,
        content,
      };
    });
  }

  static async has({ dir }) {
    return fs.existsSync(dir);
  }
}

export default FileStore;
