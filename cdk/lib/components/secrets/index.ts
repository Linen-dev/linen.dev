import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { DYNAMODB_TABLE, S3_ASSETS_BUCKET, SSM_STAGE } from '../../utils/env';

export function Secrets(scope: Construct) {
  const environment = {
    NODE_ENV: 'production',
    CACHE_TABLE: DYNAMODB_TABLE,
    LOG: 'true',
    LONG_RUNNING: 'true',
    SKIP_DYNAMO_CACHE: 'true',
    S3_UPLOAD_BUCKET: S3_ASSETS_BUCKET,
  };

  const secrets = {
    SENTRY_DSN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'sentryDns',
        { parameterName: '/linen-dev/prod/sentryDns', version: 0 }
      )
    ),
    SENTRY_AUTH_TOKEN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'sentryAuthToken',
        { parameterName: '/linen-dev/prod/sentryAuthToken', version: 0 }
      )
    ),
    DATABASE_URL: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'databaseUrl',
        { parameterName: `/linen-dev/${SSM_STAGE}/databaseUrl`, version: 0 }
      )
    ),
    SLACK_CLIENT_ID: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'slackClientId',
        { parameterName: '/linen-dev/prod/slackClientId', version: 0 }
      )
    ),
    SLACK_CLIENT_SECRET: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'slackClientSecret',
        { parameterName: '/linen-dev/prod/slackClientSecret', version: 0 }
      )
    ),
    COMPANY_SLACK_BOT_TOKEN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'companySlackToken',
        { parameterName: '/linen-dev/prod/slackToken', version: 0 }
      )
    ),
    SLACK_TOKEN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'slackToken',
        { parameterName: '/linen-dev/prod/slackToken', version: 0 }
      )
    ),
    NEXTAUTH_SECRET: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'nextAuthSecret',
        { parameterName: '/linen-dev/prod/nextAuthSecret', version: 0 }
      )
    ),
    DISCORD_TOKEN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'discordToken',
        { parameterName: '/linen-dev/prod/discordToken', version: 0 }
      )
    ),
  };

  return { environment, secrets };
}
