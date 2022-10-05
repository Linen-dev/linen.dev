import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

type SyncDiscordType = {
  cluster: cdk.aws_ecs.Cluster;
  dockerImage: cdk.aws_ecs.AssetImage;
  secrets: Record<string, cdk.aws_ecs.Secret>;
  environment: Record<string, string>;
  s3AccessPolicy: cdk.aws_iam.PolicyStatement;
  mailerAccessPolicy: cdk.aws_iam.PolicyStatement;
};

export function SyncDiscord(
  scope: Construct,
  {
    cluster,
    dockerImage,
    secrets,
    environment,
    s3AccessPolicy,
    mailerAccessPolicy,
  }: SyncDiscordType
) {
  const discordTaskDef = new cdk.aws_ecs.FargateService(
    scope,
    'syncDiscordService',
    {
      cluster,
      taskDefinition: new cdk.aws_ecs.FargateTaskDefinition(
        scope,
        'syncDiscordTaskDef',
        {
          memoryLimitMiB: 512,
          cpu: 256,
        }
      ),
      desiredCount: 1,
      assignPublicIp: true,
    }
  );
  discordTaskDef.taskDefinition.addContainer('syncDiscordTask', {
    image: dockerImage,
    command: ['npm', 'run', 'script:sync:discord', '--ignore-scripts'],
    secrets,
    environment,
    logging: cdk.aws_ecs.LogDriver.awsLogs({
      streamPrefix: 'linen-dev-syncDiscord',
      logGroup: new cdk.aws_logs.LogGroup(scope, 'syncDiscordLogGroup', {
        retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
      }),
    }),
  });
  discordTaskDef.taskDefinition.addToTaskRolePolicy(s3AccessPolicy);
  discordTaskDef.taskDefinition.addToTaskRolePolicy(mailerAccessPolicy);
}
