import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

type MaintenanceType = {
  cluster: cdk.aws_ecs.Cluster;
  dockerImage: cdk.aws_ecs.AssetImage;
  secrets: Record<string, cdk.aws_ecs.Secret>;
  environment: Record<string, string>;
  s3AccessPolicy: cdk.aws_iam.PolicyStatement;
  mailerAccessPolicy: cdk.aws_iam.PolicyStatement;
};

export function Maintenance(
  scope: Construct,
  {
    cluster,
    dockerImage,
    secrets,
    environment,
    s3AccessPolicy,
    mailerAccessPolicy,
  }: MaintenanceType
) {
  const maintenanceTaskDef = new cdk.aws_ecs_patterns.ScheduledFargateTask(
    scope,
    'maintenance',
    {
      cluster,
      subnetSelection: {
        subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
        onePerAz: true,
      },
      scheduledFargateTaskImageOptions: {
        image: dockerImage,
        memoryLimitMiB: 2048,
        cpu: 1024,
        command: ['npm', 'run', 'script:maintenance', '--ignore-scripts'],
        secrets,
        environment,
        logDriver: cdk.aws_ecs.LogDriver.awsLogs({
          streamPrefix: 'linen-dev-maintenance',
          logGroup: new cdk.aws_logs.LogGroup(scope, 'maintenanceLogGroup', {
            retention: cdk.aws_logs.RetentionDays.ONE_MONTH,
          }),
        }),
      },
      schedule: cdk.aws_applicationautoscaling.Schedule.cron({
        minute: '00',
        hour: '3',
      }),
      platformVersion: cdk.aws_ecs.FargatePlatformVersion.LATEST,
    }
  );
  maintenanceTaskDef.taskDefinition.addToTaskRolePolicy(s3AccessPolicy);
  maintenanceTaskDef.taskDefinition.addToTaskRolePolicy(mailerAccessPolicy);
}
