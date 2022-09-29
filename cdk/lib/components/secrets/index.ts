import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { environment } from '../../utils/env';
const { SSM_STAGE } = environment;

export function Secrets(scope: Construct) {
  const secrets = {
    SENTRY_DSN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'sentryDns',
        { parameterName: `/linen-dev/${SSM_STAGE}/sentryDns` }
      )
    ),
    SENTRY_AUTH_TOKEN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'sentryAuthToken',
        { parameterName: `/linen-dev/${SSM_STAGE}/sentryAuthToken` }
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
        { parameterName: `/linen-dev/${SSM_STAGE}/slackClientId` }
      )
    ),
    SLACK_CLIENT_SECRET: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'slackClientSecret',
        { parameterName: `/linen-dev/${SSM_STAGE}/slackClientSecret` }
      )
    ),
    COMPANY_SLACK_BOT_TOKEN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'companySlackToken',
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
    // VERCEL_ACCESS_TOKEN: TODO
    // VERCEL_TEAM_ID: TODO
    // STRIPE_API_KEY: TODO
    // STRIPE_WEBHOOK_SECRET: TODO
    // DISCORD_CLIENT_SECRET: TODO
    // NEXT_PUBLIC_DISCORD_CLIENT_ID: TODO
    // NEXT_PUBLIC_POSTHOG_API_KEY: TODO
    NEXT_PUBLIC_SENTRY_DSN: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'sentryDnsPublic',
        { parameterName: `/linen-dev/${SSM_STAGE}/sentryDns` }
      )
    ),
    NEXT_PUBLIC_SLACK_CLIENT_ID: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'slackClientIdPublic',
        { parameterName: `/linen-dev/${SSM_STAGE}/slackClientId` }
      )
    ),
    EMAIL_HOST: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'emailHost',
        { parameterName: `/linen-dev/prod/emailHost` }
      )
    ),
    EMAIL_USER: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'emailUser',
        { parameterName: `/linen-dev/prod/emailUser` }
      )
    ),
    EMAIL_PASS: cdk.aws_ecs.Secret.fromSsmParameter(
      cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
        scope,
        'emailPass',
        { parameterName: `/linen-dev/prod/emailPass` }
      )
    ),
  };

  return { secrets };
}
