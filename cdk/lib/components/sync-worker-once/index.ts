import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

type SyncWorkerOnceType = {
  cluster: cdk.aws_ecs.Cluster;
  dockerImage: cdk.aws_ecs.AssetImage;
  secrets: Record<string, cdk.aws_ecs.Secret>;
  environment: Record<string, string>;
  cacheTableAccessPolicy: cdk.aws_iam.PolicyStatement;
  mailerAccessPolicy: cdk.aws_iam.PolicyStatement;
};

export function SyncWorkerOnce(
  scope: Construct,
  {
    cluster,
    dockerImage,
    secrets,
    environment,
    cacheTableAccessPolicy,
    mailerAccessPolicy,
  }: SyncWorkerOnceType
) {
  const SyncWorkerOnceDef = new cdk.aws_ecs.FargateService(
    scope,
    'SyncWorkerOnceService',
    {
      cluster,
      taskDefinition: new cdk.aws_ecs.FargateTaskDefinition(
        scope,
        'SyncWorkerOnceTaskDef',
        {
          memoryLimitMiB: 4096,
          cpu: 512,
        }
      ),
      desiredCount: 0,
      assignPublicIp: true,
    }
  );
  SyncWorkerOnceDef.taskDefinition.addContainer('SyncWorkerOnceTask', {
    image: dockerImage,
    command: ['npm', 'run', 'queue:worker:syncRunOnce'],
    secrets,
    environment,
    logging: cdk.aws_ecs.LogDriver.awsLogs({
      streamPrefix: 'linen-dev-SyncWorkerOnce',
      logGroup: new cdk.aws_logs.LogGroup(scope, 'SyncWorkerOnceLogGroup', {
        retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
      }),
    }),
  });
  SyncWorkerOnceDef.taskDefinition.addToTaskRolePolicy(cacheTableAccessPolicy);
  SyncWorkerOnceDef.taskDefinition.addToTaskRolePolicy(mailerAccessPolicy);
}
