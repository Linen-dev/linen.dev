import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
      clusterName: 'nextJSCluster',
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

    const repo = ecr.Repository.fromRepositoryName(
      this,
      'LinenDevRepo',
      'linen-dev'
    );

    const container = taskDefinition.addContainer('nextJSContainer', {
      image: ecs.EcrImage.fromEcrRepository(repo, process.env.APP_VERSION),
      environment: {
        NODE_ENV: 'production',
      },
      secrets: {
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
            { parameterName: '/linen-dev/prod/databaseUrl', version: 0 }
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
      },
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'linen-dev',
        logRetention: cdk.aws_logs.RetentionDays.FIVE_DAYS,
      }),
    });

    container.addPortMappings({
      containerPort: 3000,
    });

    // new ecs.FargateService(this, 'nextJSService', {
    //   taskDefinition,
    //   cluster,
    //   desiredCount: 1,
    //   serviceName: 'nextJSService',
    //   assignPublicIp: true,
    //   securityGroups: [securityGroup],
    // });

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
  }
}
