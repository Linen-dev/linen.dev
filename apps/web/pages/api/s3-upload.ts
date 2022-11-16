import { APIRoute } from 'next-s3-upload';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export default APIRoute.configure({
  key(req, filename) {
    let asset = req.body.asset;
    let ext = path.extname(filename);
    let name = filename.substring(0, filename.indexOf(ext));
    let uuidFilename = name + uuidv4() + ext;

    return `${asset}/${uuidFilename}`;
  },
});
