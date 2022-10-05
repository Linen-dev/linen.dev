import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { certs } from '../../utils/env';

type PushServiceType = {
  cluster: cdk.aws_ecs.Cluster;
  dockerImage: cdk.aws_ecs.AssetImage;
  secrets: Record<string, cdk.aws_ecs.Secret>;
  environment: Record<string, string>;
  s3AccessPolicy: cdk.aws_iam.PolicyStatement;
  mailerAccessPolicy: cdk.aws_iam.PolicyStatement;
  securityGroup: cdk.aws_ec2.ISecurityGroup;
};

export function PushService(
  scope: Construct,
  {
    cluster,
    dockerImage,
    secrets,
    environment,
    s3AccessPolicy,
    mailerAccessPolicy,
    securityGroup,
  }: PushServiceType
) {
  const pushServiceTaskDef = new cdk.aws_ecs.FargateTaskDefinition(
    scope,
    'pushServiceTaskDef'
  );
  pushServiceTaskDef.addToTaskRolePolicy(s3AccessPolicy);
  pushServiceTaskDef.addToTaskRolePolicy(mailerAccessPolicy);

  const container = pushServiceTaskDef.addContainer('PushServiceContainer', {
    image: dockerImage,
    command: ['mix', 'phx.server'],
    environment,
    secrets,
    logging: cdk.aws_ecs.LogDriver.awsLogs({
      streamPrefix: 'PushService',
      logRetention: cdk.aws_logs.RetentionDays.FIVE_DAYS,
    }),
  });

  container.addPortMappings({
    containerPort: 4000,
  });

  const pushService =
    new cdk.aws_ecs_patterns.ApplicationLoadBalancedFargateService(
      scope,
      'PushService',
      {
        cluster,
        assignPublicIp: true,
        publicLoadBalancer: true,
        cpu: 2048,
        memoryLimitMiB: 4096,
        desiredCount: 1,
        taskDefinition: pushServiceTaskDef,
        securityGroups: [securityGroup],
        redirectHTTP: true,
        certificate: Certificate.fromCertificateArn(
          scope,
          'PushServiceCert',
          certs.push
        ),
      }
    );
  const { loadBalancer } = pushService;

  pushService.targetGroup.configureHealthCheck({
    path: '/api/health',
    interval: cdk.Duration.seconds(120),
    unhealthyThresholdCount: 3,
  });

  return { loadBalancer };
}
