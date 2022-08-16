import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

type NextAppType = {
  cluster: cdk.aws_ecs.Cluster;
  dockerImage: cdk.aws_ecs.AssetImage;
  secrets: Record<string, cdk.aws_ecs.Secret>;
  environment: Record<string, string>;
  cacheTableAccessPolicy: cdk.aws_iam.PolicyStatement;
  mailerAccessPolicy: cdk.aws_iam.PolicyStatement;
  securityGroup: cdk.aws_ec2.ISecurityGroup;
};

export function NextApp(
  scope: Construct,
  {
    cluster,
    dockerImage,
    secrets,
    environment,
    cacheTableAccessPolicy,
    mailerAccessPolicy,
    securityGroup,
  }: NextAppType
) {
  const nextjsTaskDefinition = new cdk.aws_ecs.FargateTaskDefinition(
    scope,
    'nextJSTaskDefinition',
    {
      memoryLimitMiB: 4096,
      cpu: 512,
    }
  );
  nextjsTaskDefinition.addToTaskRolePolicy(cacheTableAccessPolicy);
  nextjsTaskDefinition.addToTaskRolePolicy(mailerAccessPolicy);

  const container = nextjsTaskDefinition.addContainer('nextJSContainer', {
    image: dockerImage,
    command: ['npm', 'run', 'start:prod'],
    environment,
    secrets,
    logging: cdk.aws_ecs.LogDriver.awsLogs({
      streamPrefix: 'linen-dev',
      logRetention: cdk.aws_logs.RetentionDays.FIVE_DAYS,
    }),
  });

  container.addPortMappings({
    containerPort: 3000,
  });

  const fargateService =
    new cdk.aws_ecs_patterns.ApplicationLoadBalancedFargateService(
      scope,
      'MyFargateService',
      {
        cluster,
        assignPublicIp: true,
        publicLoadBalancer: true,
        cpu: 512,
        desiredCount: 1,
        memoryLimitMiB: 4096,
        taskDefinition: nextjsTaskDefinition,
        securityGroups: [securityGroup],
      }
    );
  const { loadBalancer } = fargateService;

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
    targetUtilizationPercent: 50,
  });
  scalableTarget.scaleOnMemoryUtilization('memoryScaling', {
    targetUtilizationPercent: 50,
  });

  return { loadBalancer };
}
