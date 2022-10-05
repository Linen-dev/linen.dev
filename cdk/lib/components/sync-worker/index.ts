import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

type SyncWorkerType = {
  cluster: cdk.aws_ecs.Cluster;
  dockerImage: cdk.aws_ecs.AssetImage;
  secrets: Record<string, cdk.aws_ecs.Secret>;
  environment: Record<string, string>;
  s3AccessPolicy: cdk.aws_iam.PolicyStatement;
  mailerAccessPolicy: cdk.aws_iam.PolicyStatement;
};

export function SyncWorker(
  scope: Construct,
  {
    cluster,
    dockerImage,
    secrets,
    environment,
    s3AccessPolicy,
    mailerAccessPolicy,
  }: SyncWorkerType
) {
  const SyncWorkerDef = new cdk.aws_ecs.FargateService(
    scope,
    'SyncWorkerService',
    {
      cluster,
      taskDefinition: new cdk.aws_ecs.FargateTaskDefinition(
        scope,
        'SyncWorkerTaskDef',
        {
          memoryLimitMiB: 4096,
          cpu: 512,
        }
      ),
      desiredCount: 1,
      assignPublicIp: true,
    }
  );
  SyncWorkerDef.taskDefinition.addContainer('SyncWorkerTask', {
    image: dockerImage,
    command: ['npm', 'run', 'start:queue:sync'],
    secrets,
    environment,
    logging: cdk.aws_ecs.LogDriver.awsLogs({
      streamPrefix: 'linen-dev-SyncWorker',
      logGroup: new cdk.aws_logs.LogGroup(scope, 'SyncWorkerLogGroup', {
        retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
      }),
    }),
  });
  SyncWorkerDef.taskDefinition.addToTaskRolePolicy(s3AccessPolicy);
  SyncWorkerDef.taskDefinition.addToTaskRolePolicy(mailerAccessPolicy);
}
