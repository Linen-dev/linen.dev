const aws = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
};
export const { account, region } = aws;
export const BRANCH = process.env.BRANCH;
const isProd = process.env.BRANCH === 'main';

export const certs = {
  push: 'arn:aws:acm:us-east-1:775327867774:certificate/b483cf2e-d0ab-46dc-af47-44d654708ab9',
  cname:
    'arn:aws:acm:us-east-1:775327867774:certificate/76fb49ee-e1d5-41ff-9424-363eb99bb5a1',
};

const aliases = {
  push: (isProd ? '' : 'staging.') + 'push.linendomain.dev',
  cname: (isProd ? '' : 'staging.') + 'cname.linendomain.dev',
};

export const environment: Record<string, string> = {
  STACK_NAME: isProd ? 'LinenDev-main' : 'LinenDev-staging',
  SSM_STAGE: isProd ? 'prod' : 'staging',
  NODE_ENV: 'production',
  // DATABASE_URL: secrets or process.env.DATABASE_URL!,
  // RDS_CERTIFICATE: secrets
  LONG_RUNNING: 'true',
  S3_UPLOAD_REGION: region!,
  S3_UPLOAD_BUCKET: isProd ? 'linen-assets' : 'linen-assets-staging',
  // S3_UPLOAD_KEY: // fargate uses iam role,
  // S3_UPLOAD_SECRET: // fargate uses iam role,
  SKIP_SENTRY: isProd ? 'false' : 'true',
  // EMAIL_HOST: secrets
  // EMAIL_USER: secrets
  // EMAIL_PASS: secrets
  NOREPLY_EMAIL: 'no-reply@linendev.com',
  SUPPORT_EMAIL: 'help@linen.dev',
  NEXTAUTH_URL: 'https://' + aliases.cname,
  // NEXTAUTH_SECRET: secrets
  // PUSH_SERVICE_KEY: secrets,
  PUSH_SERVICE_URL: 'https://' + aliases.push,
  AUTH_SERVICE_URL: 'https://linen.dev',
  // VERCEL_ACCESS_TOKEN: secrets,
  // VERCEL_TEAM_ID: secrets,
  // STRIPE_API_KEY: secrets,
  // STRIPE_WEBHOOK_SECRET: secrets,
  // DISCORD_TOKEN: secrets,
  // DISCORD_CLIENT_SECRET: secrets
  // SLACK_CLIENT_SECRET: secrets
  // COMPANY_SLACK_BOT_TOKEN: secrets,
  // dev helpers
  SKIP_REDIRECT: isProd ? 'false' : 'true',
  SKIP_ENCODE_CURSOR: 'false',
  SKIP_NOTIFICATION: 'false',
  // build
  ANALYZE: 'false',
  // WIP
  GPT3_SECRETS_KEY: 'WIP',

  // nextjs only
  // NEXT_PUBLIC_SKIP_SENTRY: isProd ? 'false' : 'true',
  // // NEXT_PUBLIC_SENTRY_DSN: secret
  // NEXT_PUBLIC_PUSH_SERVICE_URL: 'wss://' + aliases.push,
  // NEXT_PUBLIC_SKIP_POSTHOG: 'true',
  // NEXT_PUBLIC_POSTHOG_API_KEY: '',

  // NEXT_PUBLIC_REDIRECT_URI: 'https://' + aliases.cname + '/api/oauth',
  // // NEXT_PUBLIC_SLACK_CLIENT_ID: secrets
  // // NEXT_PUBLIC_DISCORD_CLIENT_ID: secrets
  // NEXT_PUBLIC_DISCORD_REDIRECT_URI:
  //   'https://' + aliases.cname + '/api/discordOauth',
};
