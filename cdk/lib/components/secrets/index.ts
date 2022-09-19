import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { SSM_STAGE } from '../../utils/env';

export function Secrets(scope: Construct) {
  const secrets = {
    SENTRY_DSN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'sentryDns',
        { parameterName: '/linen-dev/prod/sentryDns' }
      )
    ),
    SENTRY_AUTH_TOKEN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'sentryAuthToken',
        { parameterName: '/linen-dev/prod/sentryAuthToken' }
      )
    ),
    DATABASE_URL: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'databaseUrl',
        { parameterName: `/linen-dev/${SSM_STAGE}/databaseUrl` }
      )
    ),
    SLACK_CLIENT_ID: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'slackClientId',
        { parameterName: '/linen-dev/prod/slackClientId' }
      )
    ),
    SLACK_CLIENT_SECRET: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'slackClientSecret',
        { parameterName: '/linen-dev/prod/slackClientSecret' }
      )
    ),
    COMPANY_SLACK_BOT_TOKEN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'companySlackToken',
        { parameterName: '/linen-dev/prod/slackToken' }
      )
    ),
    SLACK_TOKEN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'slackToken',
        { parameterName: '/linen-dev/prod/slackToken' }
      )
    ),
    NEXTAUTH_SECRET: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'nextAuthSecret',
        { parameterName: '/linen-dev/prod/nextAuthSecret' }
      )
    ),
    DISCORD_TOKEN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'discordToken',
        { parameterName: '/linen-dev/prod/discordToken' }
      )
    ),
    RDS_CERTIFICATE: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'rdsCertificate',
        { parameterName: '/linen-dev/prod/rdsCertificate' }
      )
    ),
    PUSH_SERVICE_KEY: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'pushServiceKey',
        { parameterName: '/linen-dev/prod/pushServiceKey' }
      )
    ),
    SECRET_KEY_BASE: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'pushSecretKeyBase',
        { parameterName: '/linen-dev/prod/pushSecretKeyBase' }
      )
    ),
  };

  return { secrets };
}
