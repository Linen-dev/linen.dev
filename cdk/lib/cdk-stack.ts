import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as path from 'path';

const BRANCH = process.env.BRANCH || 'staging';
const DYNAMODB_TABLE = BRANCH === 'main' ? 'cache_prod' : 'cache-staging';
const SSM_STAGE = BRANCH === 'main' ? 'prod' : 'staging';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dockerImage = new ecs.AssetImage(
      path.join(__dirname, '../../nextjs'),
      {
        buildArgs: {
          DATABASE_URL: process.env.DATABASE_URL as string,
        },
      }
    );

    const cacheTableAccessPolicy = new cdk.aws_iam.PolicyStatement({
      actions: ['dynamodb:PutItem', 'dynamodb:GetItem'],
      resources: [
        `arn:aws:dynamodb:us-east-1:775327867774:table/${DYNAMODB_TABLE}`,
      ],
    });

    const vpc = new ec2.Vpc(this, 'fargateVpc', {
      maxAzs: 2,
    });

    const securityGroup = new ec2.SecurityGroup(this, 'fargateSecurity', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'fargateSecurity',
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    const cluster = new ecs.Cluster(this, 'nextJSCluster', {
      containerInsights: true,
      vpc,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      'nextJSTaskDefinition',
      {
        memoryLimitMiB: 512,
        cpu: 256,
        //executionRole: execRole,
        //taskRole: containerTaskRole,
      }
    );
    taskDefinition.addToTaskRolePolicy(cacheTableAccessPolicy);

    const environment = {
      NODE_ENV: 'production',
      CACHE_TABLE: DYNAMODB_TABLE,
      LOG: 'true',
      LONG_RUNNING: 'true',
      SKIP_DYNAMO_CACHE: 'true',
    };

    const secrets = {
      SENTRY_DSN: ecs.Secret.fromSsmParameter(
        cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          'sentryDns',
          { parameterName: '/linen-dev/prod/sentryDns', version: 0 }
        )
      ),
      SENTRY_AUTH_TOKEN: ecs.Secret.fromSsmParameter(
        cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          'sentryAuthToken',
          { parameterName: '/linen-dev/prod/sentryAuthToken', version: 0 }
        )
      ),
      DATABASE_URL: ecs.Secret.fromSsmParameter(
        cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          'databaseUrl',
          { parameterName: `/linen-dev/${SSM_STAGE}/databaseUrl`, version: 0 }
        )
      ),
      SLACK_CLIENT_ID: ecs.Secret.fromSsmParameter(
        cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          'slackClientId',
          { parameterName: '/linen-dev/prod/slackClientId', version: 0 }
        )
      ),
      SLACK_CLIENT_SECRET: ecs.Secret.fromSsmParameter(
        cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          'slackClientSecret',
          { parameterName: '/linen-dev/prod/slackClientSecret', version: 0 }
        )
      ),
      SLACK_TOKEN: ecs.Secret.fromSsmParameter(
        cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          'slackToken',
          { parameterName: '/linen-dev/prod/slackToken', version: 0 }
        )
      ),
      NEXTAUTH_SECRET: ecs.Secret.fromSsmParameter(
        cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          'nextAuthSecret',
          { parameterName: '/linen-dev/prod/nextAuthSecret', version: 0 }
        )
      ),
      DISCORD_TOKEN: ecs.Secret.fromSsmParameter(
        cdk.aws_ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          'discordToken',
          { parameterName: '/linen-dev/prod/discordToken', version: 0 }
        )
      ),
    };

    const container = taskDefinition.addContainer('nextJSContainer', {
      image: dockerImage,
      command: ['node', 'server.js'],
      environment,
      secrets,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'linen-dev',
        logRetention: cdk.aws_logs.RetentionDays.FIVE_DAYS,
      }),
    });

    container.addPortMappings({
      containerPort: 3000,
    });

    const fargateService =
      new ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        'MyFargateService',
        {
          cluster,
          publicLoadBalancer: true,
          cpu: 256,
          desiredCount: 1,
          memoryLimitMiB: 512,
          taskDefinition,
          securityGroups: [securityGroup],
        }
      );

    fargateService.targetGroup.configureHealthCheck({
      path: '/robots.txt',
      interval: cdk.Duration.seconds(120),
      unhealthyThresholdCount: 5,
    });

    const scalableTarget = fargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 2,
    });

    scalableTarget.scaleOnCpuUtilization('cpuScaling', {
      targetUtilizationPercent: 70,
    });

    new ecs_patterns.ScheduledFargateTask(this, 'crawler', {
      cluster,
      scheduledFargateTaskImageOptions: {
        image: dockerImage,
        cpu: 1024,
        memoryLimitMiB: 8192,
        command: ['npm', 'run', 'script:crawl', '--ignore-scripts'],
        secrets,
        environment,
        logDriver: ecs.LogDriver.awsLogs({
          streamPrefix: 'linen-dev-crawler',
          logGroup: new cdk.aws_logs.LogGroup(this, 'CrawlerLogGroup', {
            retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
          }),
        }),
      },
      schedule:
        cdk.aws_applicationautoscaling.Schedule.expression('rate(24 hours)'),
      platformVersion: ecs.FargatePlatformVersion.LATEST,
    }).taskDefinition.addToTaskRolePolicy(cacheTableAccessPolicy);

    new ecs.FargateService(this, 'syncDiscordService', {
      cluster,
      taskDefinition: new ecs.FargateTaskDefinition(
        this,
        'syncDiscordTaskDef',
        {
          memoryLimitMiB: 512,
          cpu: 256,
        }
      ),
      desiredCount: 1,
    }).taskDefinition
      .addContainer('syncDiscordTask', {
        image: dockerImage,
        command: ['npm', 'run', 'script:sync:discord', '--ignore-scripts'],
        secrets,
        environment,
        logging: ecs.LogDriver.awsLogs({
          streamPrefix: 'linen-dev-syncDiscord',
          logGroup: new cdk.aws_logs.LogGroup(this, 'syncDiscordLogGroup', {
            retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
          }),
        }),
      })
      .taskDefinition.addToTaskRolePolicy(cacheTableAccessPolicy);

    new ecs_patterns.ScheduledFargateTask(this, 'maintenance', {
      cluster,
      scheduledFargateTaskImageOptions: {
        image: dockerImage,
        memoryLimitMiB: 512,
        cpu: 256,
        command: ['npm', 'run', 'script:maintenance', '--ignore-scripts'],
        secrets,
        environment,
        logDriver: ecs.LogDriver.awsLogs({
          streamPrefix: 'linen-dev-maintenance',
          logGroup: new cdk.aws_logs.LogGroup(this, 'maintenanceLogGroup', {
            retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
          }),
        }),
      },
      schedule:
        cdk.aws_applicationautoscaling.Schedule.expression('rate(24 hours)'),
      platformVersion: ecs.FargatePlatformVersion.LATEST,
    }).taskDefinition.addToTaskRolePolicy(cacheTableAccessPolicy);
  }
}
