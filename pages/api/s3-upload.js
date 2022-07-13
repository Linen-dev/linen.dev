import { APIRoute } from 'next-s3-upload';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export default APIRoute.configure({
  key(req, filename) {
    let asset = req.body.asset;
    let ext = path.extname(filename);
    let uuidFilename = uuidv4() + ext;

    return `${asset}/${uuidFilename}`;
  },
});
