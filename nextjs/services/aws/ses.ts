import SES from 'aws-sdk/clients/ses';
import { awsCredentials } from './credentials';

declare global {
  // eslint-disable-next-line no-var
  var sesClient: SES | undefined;
}

const sesClient = global.sesClient || new SES(awsCredentials);

if (process.env.NODE_ENV !== 'production') global.sesClient = sesClient;

export { sesClient };
