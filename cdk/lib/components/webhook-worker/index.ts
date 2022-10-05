import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

type WebhookWorkerType = {
  cluster: cdk.aws_ecs.Cluster;
  dockerImage: cdk.aws_ecs.AssetImage;
  secrets: Record<string, cdk.aws_ecs.Secret>;
  environment: Record<string, string>;
  cacheTableAccessPolicy: cdk.aws_iam.PolicyStatement;
  mailerAccessPolicy: cdk.aws_iam.PolicyStatement;
};

export function WebhookWorker(
  scope: Construct,
  {
    cluster,
    dockerImage,
    secrets,
    environment,
    cacheTableAccessPolicy,
    mailerAccessPolicy,
  }: WebhookWorkerType
) {
  const WebhookWorkerDef = new cdk.aws_ecs.FargateService(
    scope,
    'WebhookWorkerService',
    {
      cluster,
      taskDefinition: new cdk.aws_ecs.FargateTaskDefinition(
        scope,
        'WebhookWorkerTaskDef',
        {
          memoryLimitMiB: 4096,
          cpu: 512,
        }
      ),
      desiredCount: 1,
      assignPublicIp: true,
    }
  );
  WebhookWorkerDef.taskDefinition.addContainer('WebhookWorkerTask', {
    image: dockerImage,
    command: ['npm', 'run', 'start:queue:webhook'],
    secrets,
    environment,
    logging: cdk.aws_ecs.LogDriver.awsLogs({
      streamPrefix: 'linen-dev-WebhookWorker',
      logGroup: new cdk.aws_logs.LogGroup(scope, 'WebhookWorkerLogGroup', {
        retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
      }),
    }),
  });
  WebhookWorkerDef.taskDefinition.addToTaskRolePolicy(cacheTableAccessPolicy);
  WebhookWorkerDef.taskDefinition.addToTaskRolePolicy(mailerAccessPolicy);
}
