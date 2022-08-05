const aws = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
};

const config: Record<
  string,
  {
    DYNAMODB_TABLE: string;
    SSM_STAGE: string;
    S3_ASSETS_BUCKET: string;
    stackName: string;
  }
> = {
  main: {
    DYNAMODB_TABLE: 'cache_prod',
    SSM_STAGE: 'prod',
    S3_ASSETS_BUCKET: 'linen-assets',
    stackName: 'LinenDev-main',
  },
  staging: {
    DYNAMODB_TABLE: 'cache-staging',
    SSM_STAGE: 'staging',
    S3_ASSETS_BUCKET: 'linen-assets-staging',
    stackName: 'LinenDev-staging',
  },
};

const branch = process.env.BRANCH || 'staging';
const isProd = branch === 'main';

export const { DYNAMODB_TABLE, SSM_STAGE, S3_ASSETS_BUCKET, stackName } = isProd
  ? config.main
  : config.staging;

export const BRANCH = branch;
export const { account, region } = aws;
