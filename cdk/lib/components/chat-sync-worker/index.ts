import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

type ChatSyncWorkerType = {
  cluster: cdk.aws_ecs.Cluster;
  dockerImage: cdk.aws_ecs.AssetImage;
  secrets: Record<string, cdk.aws_ecs.Secret>;
  environment: Record<string, string>;
  cacheTableAccessPolicy: cdk.aws_iam.PolicyStatement;
  mailerAccessPolicy: cdk.aws_iam.PolicyStatement;
};

export function ChatSyncWorker(
  scope: Construct,
  {
    cluster,
    dockerImage,
    secrets,
    environment,
    cacheTableAccessPolicy,
    mailerAccessPolicy,
  }: ChatSyncWorkerType
) {
  const chatSyncWorkerDef = new cdk.aws_ecs.FargateService(
    scope,
    'chatSyncWorkerService',
    {
      cluster,
      taskDefinition: new cdk.aws_ecs.FargateTaskDefinition(
        scope,
        'chatSyncWorkerTaskDef',
        {
          memoryLimitMiB: 1024,
          cpu: 512,
        }
      ),
      desiredCount: 1,
      assignPublicIp: true,
    }
  );
  chatSyncWorkerDef.taskDefinition.addContainer('chatSyncWorkerTask', {
    image: dockerImage,
    command: ['npm', 'run', 'start:queue:chat-sync'],
    secrets,
    environment,
    logging: cdk.aws_ecs.LogDriver.awsLogs({
      streamPrefix: 'linen-dev-chatSyncWorker',
      logGroup: new cdk.aws_logs.LogGroup(scope, 'chatSyncWorkerLogGroup', {
        retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
      }),
    }),
  });
  chatSyncWorkerDef.taskDefinition.addToTaskRolePolicy(cacheTableAccessPolicy);
  chatSyncWorkerDef.taskDefinition.addToTaskRolePolicy(mailerAccessPolicy);
}
