import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

type QueueWorkerType = {
  cluster: cdk.aws_ecs.Cluster;
  dockerImage: cdk.aws_ecs.AssetImage;
  secrets: Record<string, cdk.aws_ecs.Secret>;
  environment: Record<string, string>;
  cacheTableAccessPolicy: cdk.aws_iam.PolicyStatement;
  mailerAccessPolicy: cdk.aws_iam.PolicyStatement;
};

export function QueueWorker(
  scope: Construct,
  {
    cluster,
    dockerImage,
    secrets,
    environment,
    cacheTableAccessPolicy,
    mailerAccessPolicy,
  }: QueueWorkerType
) {
  const queueWorkerDef = new cdk.aws_ecs.FargateService(
    scope,
    'QueueWorkerService',
    {
      cluster,
      taskDefinition: new cdk.aws_ecs.FargateTaskDefinition(
        scope,
        'QueueWorkerTaskDef',
        {
          memoryLimitMiB: 4096,
          cpu: 512,
        }
      ),
      desiredCount: 1,
      assignPublicIp: true,
    }
  );
  queueWorkerDef.taskDefinition.addContainer('QueueWorkerTask', {
    image: dockerImage,
    command: ['npm', 'run', 'start:queue:webhook'],
    secrets,
    environment,
    logging: cdk.aws_ecs.LogDriver.awsLogs({
      streamPrefix: 'linen-dev-QueueWorker',
      logGroup: new cdk.aws_logs.LogGroup(scope, 'QueueWorkerLogGroup', {
        retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
      }),
    }),
  });
  queueWorkerDef.taskDefinition.addToTaskRolePolicy(cacheTableAccessPolicy);
  queueWorkerDef.taskDefinition.addToTaskRolePolicy(mailerAccessPolicy);
}
