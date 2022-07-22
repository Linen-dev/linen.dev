import DynamoDB from 'aws-sdk/clients/dynamodb';

import { awsCredentials } from './credentials';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var DocumentClient: DynamoDB.DocumentClient | undefined;
}

const DocumentClient =
  global.DocumentClient || new DynamoDB.DocumentClient(awsCredentials);

if (process.env.NODE_ENV !== 'production')
  global.DocumentClient = DocumentClient;

export { DocumentClient };
