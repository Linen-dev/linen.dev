const aws = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
};

const branch = process.env.BRANCH || 'staging';
const isProd = branch === 'main';

export const {
  DYNAMODB_TABLE,
  SSM_STAGE,
  S3_ASSETS_BUCKET,
  stackName,
  SKIP_NOTIFICATION,
}: {
  DYNAMODB_TABLE: string;
  SSM_STAGE: string;
  S3_ASSETS_BUCKET: string;
  stackName: string;
  SKIP_NOTIFICATION: string;
} = isProd
  ? {
      DYNAMODB_TABLE: 'cache_prod',
      SSM_STAGE: 'prod',
      S3_ASSETS_BUCKET: 'linen-assets',
      stackName: 'LinenDev-main',
      SKIP_NOTIFICATION: 'false',
    }
  : {
      DYNAMODB_TABLE: 'cache-staging',
      SSM_STAGE: 'staging',
      S3_ASSETS_BUCKET: 'linen-assets-staging',
      stackName: 'LinenDev-staging',
      SKIP_NOTIFICATION: 'true',
    };

const arnCert = 'arn:aws:acm:us-east-1:775327867774:certificate/';
export const certs = {
  push: arnCert + 'b483cf2e-d0ab-46dc-af47-44d654708ab9',
  cname: arnCert + '76fb49ee-e1d5-41ff-9424-363eb99bb5a1',
};

export const aliases = {
  push: (!isProd && 'staging.') + 'push.linendomain.dev',
  cname: (!isProd && 'staging.') + 'cname.linendomain.dev',
};

export const BRANCH = branch;
export const { account, region } = aws;

export const environment = {
  NODE_ENV: 'production',
  CACHE_TABLE: DYNAMODB_TABLE,
  LOG: 'true',
  LONG_RUNNING: 'true',
  SKIP_DYNAMO_CACHE: 'true',
  S3_UPLOAD_BUCKET: S3_ASSETS_BUCKET,
  PUSH_SERVICE_URL: 'https://' + aliases.push,
};

export const DATABASE_URL = process.env.DATABASE_URL!;
export const NEXT_PUBLIC_PUSH_SERVICE_URL = 'wss://' + aliases.push;
