import os from 'os';
import fs from 'fs';
import axios from 'axios';

/**
 * RDS_CERTIFICATE will be our flag for append ssl data into our db connection string
 * if is empty, it will skip all ssl related functionalities
 */
const isSsl = () => process.env.RDS_CERTIFICATE;

// this url shouldn't change but it could be an environment variable
const AWS_CERT_URL =
  'https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem';

const certOut = `${os.tmpdir()}/rds-ca-2019-root.pem`;

function isFileExist() {
  if (!fs.existsSync(certOut)) throw 'pem not found';
}

function createFile(data: any) {
  console.log(`Writing certificate to ${certOut}`);
  fs.writeFileSync(certOut, String(data));
  isFileExist();
}

/**
 * this function helps fargate tasks to download the cert instead of getting it from env-vars
 */
export async function downloadCert() {
  if (!isSsl()) return;
  const response = await axios.get(AWS_CERT_URL);
  createFile(response.data);
}

/**
 * this function helps vercel functions to avoid download the cert since it can get it from env-vars
 */
function createCertFile({ cert }: { cert?: string }) {
  if (!isSsl()) return;
  if (!fs.existsSync(certOut)) {
    createFile(cert);
  }
  return certOut;
}

/**
 * this function will return the connection string for our database
 * - if cert is present, it will persist it as a pem file and append it to our connection string
 * - if cert is missing, mostly on local development, it will build a connection string without ssl
 * - if database url is missing, it will throw an exception
 */
export function getDatabaseUrl({
  dbUrl,
  cert,
}: {
  dbUrl?: string;
  cert?: string;
}) {
  if (!dbUrl) return '';

  const certLocation = createCertFile({ cert });
  if (!certLocation) return dbUrl;

  const join = dbUrl.indexOf('?') > -1 ? '&' : '?';
  return dbUrl + `${join}ssl=true&sslrootcert=${certLocation}`;
}
