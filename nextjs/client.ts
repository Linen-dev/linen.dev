import { PrismaClient } from '@prisma/client';
import { tmpdir } from 'os';
import fs from 'fs';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

if (!global.prisma && process.env.RDS_CERTIFICATE) {
  const certOut = `${tmpdir()}/rds-ca-2019-root.pem`;
  const cert = process.env.RDS_CERTIFICATE;
  const certExists = fs.existsSync(certOut);
  if (!certExists) {
    console.log(`Writing certificate to ${certOut}`);
    fs.writeFile(certOut, cert, (err) => {
      if (err) return console.log(err);
    });
  }
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
