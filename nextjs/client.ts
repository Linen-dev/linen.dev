import { PrismaClient } from '@prisma/client';
import { tmpdir } from 'os';
import fs from 'fs';

const rds_ca_2019_root = process.env.RDS_CERTIFICATE as string;

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const certOut = `${tmpdir()}/rds-ca-2019-root.pem`;

if (!global.prisma) {
  const certExists = fs.existsSync(certOut);
  if (!certExists) {
    console.log(`Writing certificate to ${certOut}`);
    fs.writeFileSync(certOut, rds_ca_2019_root);
  }
}

const db_url_join =
  (process.env.DATABASE_URL as string).indexOf('?') > -1 ? '&' : '?';

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}${db_url_join}sslmode=require&sslcert=${certOut}`,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
