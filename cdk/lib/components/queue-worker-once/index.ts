import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

type QueueWorkerOnceType = {
  cluster: cdk.aws_ecs.Cluster;
  dockerImage: cdk.aws_ecs.AssetImage;
  secrets: Record<string, cdk.aws_ecs.Secret>;
  environment: Record<string, string>;
  cacheTableAccessPolicy: cdk.aws_iam.PolicyStatement;
  mailerAccessPolicy: cdk.aws_iam.PolicyStatement;
};

export function QueueWorkerOnce(
  scope: Construct,
  {
    cluster,
    dockerImage,
    secrets,
    environment,
    cacheTableAccessPolicy,
    mailerAccessPolicy,
  }: QueueWorkerOnceType
) {
  const queueWorkerOnceDef = new cdk.aws_ecs.FargateService(
    scope,
    'QueueWorkerOnceService',
    {
      cluster,
      taskDefinition: new cdk.aws_ecs.FargateTaskDefinition(
        scope,
        'QueueWorkerOnceTaskDef',
        {
          memoryLimitMiB: 4096,
          cpu: 512,
        }
      ),
      desiredCount: 0,
      assignPublicIp: true,
    }
  );
  queueWorkerOnceDef.taskDefinition.addContainer('QueueWorkerOnceTask', {
    image: dockerImage,
    command: ['npm', 'run', 'queue:workerRunOnce'],
    secrets,
    environment,
    logging: cdk.aws_ecs.LogDriver.awsLogs({
      streamPrefix: 'linen-dev-QueueWorkerOnce',
      logGroup: new cdk.aws_logs.LogGroup(scope, 'QueueWorkerOnceLogGroup', {
        retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
      }),
    }),
  });
  queueWorkerOnceDef.taskDefinition.addToTaskRolePolicy(cacheTableAccessPolicy);
  queueWorkerOnceDef.taskDefinition.addToTaskRolePolicy(mailerAccessPolicy);
}
